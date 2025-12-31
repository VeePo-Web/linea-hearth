import { ChevronDown } from "lucide-react";

const LookbookHero = () => {
  const scrollToNext = () => {
    const nextSection = document.querySelector('[data-look-index="0"]');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="h-screen w-full flex items-center justify-center relative bg-stone-900 snap-start"
      style={{
        backgroundImage: 'linear-gradient(135deg, hsl(var(--stone-900)) 0%, hsl(20 14.3% 8.1%) 100%)'
      }}
    >
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="text-center text-white z-10 px-6">
        {/* Eyebrow */}
        <p className="text-xs uppercase tracking-[0.3em] text-amber-500 mb-6 font-light">
          Line of Judah
        </p>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-wide mb-6">
          The Lookbook
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl font-light text-white/70 max-w-lg mx-auto leading-relaxed">
          Curated fits for the anointed.<br />
          Shop by design, not just category.
        </p>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToNext}
          className="mt-16 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer group"
          aria-label="Scroll to explore looks"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-light">
            Scroll to Explore
          </span>
          <ChevronDown 
            className="w-5 h-5 animate-bounce" 
            style={{ animationDuration: '2s' }}
          />
        </button>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-900/50 to-transparent" />
    </section>
  );
};

export default LookbookHero;
