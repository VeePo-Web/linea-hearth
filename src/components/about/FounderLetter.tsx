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
              I got tired of hiding.<br /><br />
              Not my faith — I never hid that. But I was tired of my clothes 
              not matching my conviction. Everything in the market was either 
              corny Christian or watered-down safe.<br /><br />
              So I built what I wanted to wear.
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
              For the believer who won't apologize. Who starts conversations. 
              Who knows that if you're not for us, you're against us.<br /><br />
              This is Line of Judah. You're here because you're supposed to be.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderLetter;
