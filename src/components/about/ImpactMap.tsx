import { useEffect, useState, useRef } from 'react';
import { MapPin, GraduationCap, Globe, Heart } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  delay: number;
}

const StatItem = ({ icon, value, suffix, label, delay }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Animate count up
          setTimeout(() => {
            const duration = 2000;
            const steps = 60;
            const increment = value / steps;
            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= value) {
                setCount(value);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, duration / steps);
          }, delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, delay, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-amber-500">
        {icon}
      </div>
      <p className="text-4xl md:text-5xl font-light text-foreground mb-2" aria-live="polite">
        <span className="text-amber-500">{count}</span>
        <span className="text-muted-foreground">{suffix}</span>
      </p>
      <p className="text-sm text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
};

const ImpactMap = () => {
  const cities = [
    'Calgary', 'Toronto', 'Vancouver', 'Los Angeles', 'Dallas', 
    'Atlanta', 'Houston', 'Phoenix', 'Denver', 'Seattle'
  ];

  return (
    <section className="py-16 md:py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-4">
            Our Reach
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-foreground">
            Ministry By The Numbers
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
          <StatItem
            icon={<MapPin className="w-8 h-8" />}
            value={45}
            suffix="+"
            label="Cities"
            delay={0}
          />
          <StatItem
            icon={<GraduationCap className="w-8 h-8" />}
            value={20}
            suffix="+"
            label="Campuses"
            delay={100}
          />
          <StatItem
            icon={<Globe className="w-8 h-8" />}
            value={5}
            suffix=""
            label="Countries"
            delay={200}
          />
          <StatItem
            icon={<Heart className="w-8 h-8" />}
            value={10}
            suffix="K+"
            label="Lives Touched"
            delay={300}
          />
        </div>

        {/* Map Visualization */}
        <div className="relative h-48 md:h-64 bg-background rounded-sm overflow-hidden mb-8">
          {/* Stylized dots representing cities */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-xl h-full">
              {/* Animated pulsing dots */}
              {[
                { top: '30%', left: '15%' },   // Calgary
                { top: '35%', left: '80%' },   // Toronto
                { top: '25%', left: '10%' },   // Vancouver
                { top: '55%', left: '12%' },   // Los Angeles
                { top: '65%', left: '45%' },   // Dallas
                { top: '60%', left: '75%' },   // Atlanta
                { top: '70%', left: '42%' },   // Houston
                { top: '55%', left: '25%' },   // Phoenix
                { top: '40%', left: '30%' },   // Denver
                { top: '30%', left: '8%' },    // Seattle
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <div className="relative">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <div 
                      className="absolute inset-0 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75"
                      style={{ animationDelay: `${i * 200}ms`, animationDuration: '2s' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* City List */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-light">
            {cities.join(' • ')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ImpactMap;
