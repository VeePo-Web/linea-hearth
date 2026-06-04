import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Helmet } from "react-helmet-async";

type Submission = {
  id: string;
  order_id: string;
  customer_email: string;
  customer_first_name: string | null;
  photo_path: string;
  caption: string | null;
  city: string | null;
  status: "pending" | "approved" | "featured" | "rejected";
  submitted_at: string;
};

export default function AdminWornInTheWild() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("admin_list_worn_submissions");
    let rows = ((data as Submission[]) || []).slice(0, 100);
    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    setSubs(rows);
    setLoading(false);

    // Get signed URLs for any private (pending) photos
    const privatePaths = rows.filter((r) => r.status === "pending").map((r) => r.photo_path);
    if (privatePaths.length > 0) {
      const { data: urlData } = await supabase.functions.invoke("worn-photo-signed-urls", {
        body: { paths: privatePaths },
      });
      if (urlData?.urls) setSignedUrls(urlData.urls);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const review = async (id: string, action: "approve" | "feature" | "reject") => {
    setBusy(id);
    await supabase.functions.invoke("review-worn-submission", {
      body: { submissionId: id, action },
    });
    setBusy(null);
    load();
  };

  const photoUrl = (s: Submission) => {
    if (s.status === "pending") return signedUrls[s.photo_path] || "";
    return supabase.storage.from("product-images").getPublicUrl(s.photo_path).data.publicUrl;
  };

  return (
    <AdminLayout>
      <Helmet><title>Worn in the Wild — Ops Portal</title></Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-serif mb-1">Worn in the Wild</h1>
          <p className="text-sm text-muted-foreground">Moderate customer photo submissions.</p>
        </div>

        <div className="flex gap-2 mb-6 border-b">
          {(["pending", "approved", "featured", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors ${
                statusFilter === s ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : subs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions in this view.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subs.map((s) => (
              <div key={s.id} className="border border-border bg-card">
                <div className="aspect-[4/5] bg-muted overflow-hidden">
                  {photoUrl(s) ? (
                    <img src={photoUrl(s)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Loading photo…</div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.customer_first_name || s.customer_email}
                      {s.city && ` · ${s.city}`}
                    </span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 ${
                      s.status === "featured" ? "bg-foreground text-white" :
                      s.status === "approved" ? "bg-emerald-100 text-emerald-900" :
                      s.status === "rejected" ? "bg-red-100 text-red-900" :
                      "bg-amber-100 text-amber-900"
                    }`}>{s.status}</span>
                  </div>
                  {s.caption && <p className="text-xs text-foreground leading-relaxed">{s.caption}</p>}
                  <p className="text-[10px] text-muted-foreground">
                    Order: <a href={`/ops-portal/orders/${s.order_id}`} className="underline">{s.order_id.slice(0, 8)}</a>
                    {" · "}{new Date(s.submitted_at).toLocaleDateString()}
                  </p>
                  {s.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        disabled={busy === s.id}
                        onClick={() => review(s.id, "approve")}
                        className="flex-1 text-[10px] uppercase tracking-wider bg-foreground text-white py-2 disabled:opacity-50"
                      >Approve</button>
                      <button
                        disabled={busy === s.id}
                        onClick={() => review(s.id, "feature")}
                        className="flex-1 text-[10px] uppercase tracking-wider border border-foreground text-foreground py-2 disabled:opacity-50"
                      >Feature</button>
                      <button
                        disabled={busy === s.id}
                        onClick={() => review(s.id, "reject")}
                        className="flex-1 text-[10px] uppercase tracking-wider border border-border text-muted-foreground py-2 disabled:opacity-50"
                      >Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
