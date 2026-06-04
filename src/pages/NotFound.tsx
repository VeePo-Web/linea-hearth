import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;

const NotFound = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: prefersReducedMotion ? 0.2 : 1.2, delay, ease: editorialEase },
  });

  return (
    <>
      <Helmet>
        <title>Not Found — Line of Judah</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="relative h-[100dvh] w-full bg-background text-foreground flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* 404 superscript reference mark */}
        <motion.span
          {...fade(0.2)}
          className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-muted-foreground/50"
        >
          <sup>404</sup>
        </motion.span>

        {/* Verse — the centerpiece */}
        <div className="max-w-[420px] w-full text-center">
          <motion.p
            {...fade(0.4)}
            className="font-serif italic text-xl md:text-2xl font-light leading-[1.6] tracking-[-0.01em] text-foreground/90"
          >
            “And thou shalt make holy garments for Aaron thy brother, for glory and for beauty.”
          </motion.p>

          <motion.div
            {...fade(1.2)}
            className="mx-auto mt-10 h-px w-[40%] bg-foreground/20"
          />

          <motion.p
            {...fade(1.4)}
            className="mt-6 text-[10px] tracking-[0.4em] uppercase text-muted-foreground"
          >
            Exodus 28:2 — ASV
          </motion.p>
        </div>

        {/* Lion sigil */}
        <motion.div
          {...fade(2)}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
        >
          <img
            src="/favicon-192.png"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            className="w-9 h-9 opacity-80"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 3, ease: editorialEase }}
          >
            <Link
              to="/home"
              className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500"
            >
              Return
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
};

export default NotFound;
