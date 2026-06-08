const MARQUEE_COPY =
  "PRE-SALE NOW LIVE ◆ FIRST DROP SHIPS JULY 1ST ◆ JOIN THE TRIBE — FOUNDING MEMBER ACCESS CLOSES SOON ◆ LIMITED FIRST-RUN — ONCE IT'S GONE, IT'S GONE ◆ EXODUS 28:2 ◆ ";

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
      <span className="sr-only">{MARQUEE_COPY}</span>
      <div
        aria-hidden="true"
        className="animate-marquee flex h-full w-max items-center whitespace-nowrap text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em]"
      >
        <span className="pr-12">{MARQUEE_COPY}</span>
        <span className="pr-12">{MARQUEE_COPY}</span>
        <span className="pr-12">{MARQUEE_COPY}</span>
        <span className="pr-12">{MARQUEE_COPY}</span>
      </div>
    </div>
  );
};

export default PreSaleMarquee;
