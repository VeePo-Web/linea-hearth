const SR_COPY =
  "PRE-SALE NOW LIVE. FIRST DROP SHIPS JULY 1ST. JOIN THE TRIBE — FOUNDING MEMBER ACCESS CLOSES SOON. LIMITED FIRST-RUN — ONCE IT'S GONE, IT'S GONE. EXODUS 28:2.";

const Segment = () => (
  <span className="pr-12 inline-flex items-center gap-3">
    <span>PRE-SALE NOW LIVE</span>
    <span aria-hidden="true" className="opacity-60">◆</span>
    <span className="marquee-underline" tabIndex={0}>FIRST DROP SHIPS JULY 1ST</span>
    <span aria-hidden="true" className="opacity-60">◆</span>
    <span>JOIN THE TRIBE — <span className="marquee-underline" tabIndex={0}>FOUNDING MEMBER ACCESS CLOSES SOON</span></span>
    <span aria-hidden="true" className="opacity-60">◆</span>
    <span>LIMITED FIRST-RUN — ONCE IT'S GONE, IT'S GONE</span>
    <span aria-hidden="true" className="opacity-60">◆</span>
    <span className="opacity-80">EXODUS 28:2</span>
    <span aria-hidden="true" className="opacity-60">◆</span>
  </span>
);

const PreSaleMarquee = () => {
  return (
    <div
      role="region"
      aria-label="Pre-sale announcement"
      className="relative w-full overflow-hidden border-b border-black/40"
      style={{
        height: "var(--marquee-height)",
        backgroundColor: "hsl(var(--marquee-bg))",
        color: "hsl(var(--marquee-fg))",
      }}
    >
      <span className="sr-only">{SR_COPY}</span>
      <div
        aria-hidden="true"
        className="animate-marquee flex h-full w-max items-center whitespace-nowrap text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em]"
      >
        <Segment />
        <Segment />
        <Segment />
        <Segment />
      </div>
    </div>
  );
};

export default PreSaleMarquee;
