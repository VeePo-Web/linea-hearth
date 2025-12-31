const OriginStory = () => {
  return (
    <section className="py-16 md:py-24 px-6 bg-foreground text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Lion Imagery */}
          <div className="relative order-2 md:order-1">
            <div className="aspect-square overflow-hidden">
              {/* Placeholder for lion image - using a styled div for now */}
              <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-stone-900 flex items-center justify-center">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-3/4 h-3/4 text-amber-500/20"
                  fill="currentColor"
                >
                  {/* Stylized lion silhouette */}
                  <path d="M50 10 C30 10 20 25 20 40 C20 50 25 55 25 60 C20 65 15 70 15 80 C15 90 25 95 35 95 L65 95 C75 95 85 90 85 80 C85 70 80 65 75 60 C75 55 80 50 80 40 C80 25 70 10 50 10 M40 45 C42 45 44 47 44 50 C44 53 42 55 40 55 C38 55 36 53 36 50 C36 47 38 45 40 45 M60 45 C62 45 64 47 64 50 C64 53 62 55 60 55 C58 55 56 53 56 50 C56 47 58 45 60 45 M50 60 C45 60 42 65 45 70 L50 75 L55 70 C58 65 55 60 50 60" />
                </svg>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="space-y-8 order-1 md:order-2">
            {/* Eyebrow */}
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">
              The Name
            </p>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide">
              Line of Judah
            </h2>

            {/* Body */}
            <div className="space-y-6 text-white/80 font-light leading-relaxed">
              <p>
                <span className="text-amber-500 font-medium">Judah</span> means "praise." 
                The lion is the symbol of the tribe of Judah — from which the Messiah descended. 
                Genesis 49:9 declares, "Judah is a lion's cub... like a lion he crouches and lies down."
              </p>
              <p>
                Line of Judah is a declaration of identity. When you wear it, you're 
                not just wearing a brand — you're wearing your lineage as a child of
                the King. You carry the roar of the Lion within you.
              </p>
            </div>

            {/* Scripture */}
            <blockquote className="border-l-2 border-amber-500 pl-6 py-2">
              <p className="text-lg italic text-amber-500">
                "The Lion of the tribe of Judah has triumphed."
              </p>
              <cite className="text-sm text-white/60 not-italic mt-2 block">
                — Revelation 5:5
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OriginStory;
