const FounderLetter = () => {
  return (
    <section className="py-16 md:py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Founder Portrait */}
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src="/founders.png"
                alt="Jordan Williams, Founder of Line of Judah"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground font-light tracking-wide">
              Jordan Williams, Founder
            </p>
          </div>

          {/* Letter Content */}
          <div className="space-y-8">
            {/* Quote Marks */}
            <span className="text-6xl md:text-8xl text-amber-500/30 font-serif leading-none block">
              "
            </span>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl font-light italic text-foreground leading-relaxed -mt-8">
              Every thread carries a message. Every garment is a declaration.
              We started Line of Judah because we believe what you wear should 
              reflect who you are — and whose you are.
            </blockquote>

            {/* Signature */}
            <div className="pt-4">
              <p className="text-lg font-light text-foreground italic tracking-wide">
                Jordan Williams
              </p>
              <div className="w-24 h-px bg-amber-500 mt-2" />
            </div>

            {/* Bio */}
            <p className="text-muted-foreground font-light leading-relaxed">
              Founded in Calgary, 2022. What started as a vision to combine 
              streetwear with Scripture has grown into a global community of 
              believers wearing their faith boldly. From campus to city streets, 
              Line of Judah is more than a brand — it's a movement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderLetter;
