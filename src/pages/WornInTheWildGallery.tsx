import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Submission = {
  id: string;
  photo_path: string;
  caption: string | null;
  city: string | null;
  customer_first_name: string | null;
  status: string;
  product_ids: string[];
  featured_at: string | null;
  submitted_at: string;
};

export default function WornInTheWildGallery() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("worn_in_the_wild_submissions")
        .select("id, photo_path, caption, city, customer_first_name, status, product_ids, featured_at, submitted_at")
        .in("status", ["approved", "featured"])
        .order("featured_at", { ascending: false, nullsFirst: false })
        .order("submitted_at", { ascending: false })
        .limit(60);
      setSubs((data as Submission[]) || []);
      setLoading(false);
    })();
  }, []);

  const publicUrl = (path: string) =>
    supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;

  return (
    <>
      <Helmet>
        <title>Worn in the Wild — Line of Judah</title>
        <meta
          name="description"
          content="An archive of how Line of Judah armor lives in the real world. Submitted by the people it was made for."
        />
      </Helmet>
      <main className="min-h-[100dvh] bg-white text-black">
        <section className="max-w-6xl mx-auto px-6 pt-32 pb-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            <p className="font-serif italic text-xs text-neutral-500 mb-3 tracking-wide">An archive</p>
            <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[0.95] tracking-[-0.02em] mb-4">
              Worn in the Wild
            </h1>
            <div className="w-[40%] md:w-[20%] h-px bg-[#4CAF50]/80 mb-6" />
            <p className="font-serif italic text-sm text-neutral-500 max-w-md">
              "For glory and for beauty." — Exodus 28:2
            </p>
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-3 md:px-6 pb-32">
          {loading && <p className="text-xs text-neutral-400 px-3">Loading…</p>}
          {!loading && subs.length === 0 && (
            <p className="text-sm text-neutral-500 px-3 max-w-md">
              The wall is still being built. Check back soon.
            </p>
          )}
          {!loading && subs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {subs.map((s, i) => {
                const featured = s.status === "featured";
                return (
                  <motion.figure
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.03, 0.6) }}
                    className={featured ? "col-span-2 row-span-2" : ""}
                  >
                    <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden group">
                      <img
                        src={publicUrl(s.photo_path)}
                        alt={`${s.customer_first_name || "A customer"} wearing Line of Judah`}
                        loading="lazy"
                        className="w-full h-full object-cover md:grayscale md:group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                    {(s.customer_first_name || s.city || s.caption) && (
                      <figcaption className="pt-2 px-1 pb-4">
                        {(s.customer_first_name || s.city) && (
                          <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                            {[s.customer_first_name, s.city].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {s.caption && (
                          <p className="text-xs text-neutral-700 mt-1 leading-snug line-clamp-2">{s.caption}</p>
                        )}
                      </figcaption>
                    )}
                  </motion.figure>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
