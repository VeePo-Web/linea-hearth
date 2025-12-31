import { useState, useEffect } from "react";

interface Look {
  id: string;
  name: string;
}

interface LookNavigationProps {
  looks: Look[];
  onNavigate?: (index: number) => void;
}

const LookNavigation = ({ looks, onNavigate }: LookNavigationProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-look-index]');
      let currentIndex = -1;

      sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          currentIndex = idx;
        }
      });

      setActiveIndex(currentIndex);
    };

    // Use the scroll container instead of window
    const container = document.querySelector('.lookbook-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [looks.length]);

  const scrollToSection = (index: number) => {
    const section = document.querySelector(`[data-look-index="${index}"]`);
    section?.scrollIntoView({ behavior: 'smooth' });
    onNavigate?.(index);
  };

  const scrollToHero = () => {
    const container = document.querySelector('.lookbook-scroll-container');
    container?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFitGuide = () => {
    const section = document.querySelector('[data-section="fit-guide"]');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  if (looks.length === 0) return null;

  return (
    <nav 
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3"
      aria-label="Look navigation"
    >
      {/* Hero dot */}
      <button
        onClick={scrollToHero}
        onMouseEnter={() => setHoveredIndex(-2)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="flex items-center gap-3 group"
        aria-label="Scroll to top"
      >
        <span 
          className={`text-xs uppercase tracking-wider text-white/60 transition-opacity ${
            hoveredIndex === -2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Top
        </span>
        <span 
          className={`w-2 h-2 rounded-full border transition-all ${
            activeIndex === -1 
              ? 'bg-amber-500 border-amber-500 w-3 h-3' 
              : 'border-white/40 hover:border-white'
          }`}
        />
      </button>

      {/* Look dots */}
      {looks.map((look, index) => (
        <button
          key={look.id}
          onClick={() => scrollToSection(index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className="flex items-center gap-3 group"
          aria-label={`Scroll to ${look.name}`}
        >
          <span 
            className={`text-xs uppercase tracking-wider text-white/60 transition-opacity whitespace-nowrap ${
              hoveredIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {look.name}
          </span>
          <span 
            className={`w-2 h-2 rounded-full border transition-all ${
              activeIndex === index 
                ? 'bg-amber-500 border-amber-500 w-3 h-3' 
                : 'border-white/40 hover:border-white'
            }`}
          />
        </button>
      ))}

      {/* Fit Guide dot */}
      <button
        onClick={scrollToFitGuide}
        onMouseEnter={() => setHoveredIndex(-3)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="flex items-center gap-3 group mt-2 pt-2 border-t border-white/10"
        aria-label="Scroll to fit guide"
      >
        <span 
          className={`text-xs uppercase tracking-wider text-white/60 transition-opacity ${
            hoveredIndex === -3 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Fit Guide
        </span>
        <span className="w-2 h-2 rounded-full border border-white/40 hover:border-white transition-all" />
      </button>
    </nav>
  );
};

export default LookNavigation;
