import { Megaphone, Crown, Flame } from 'lucide-react';

const pillars = [
  {
    icon: Megaphone,
    title: 'Evangelism',
    description: "Every outfit is an open door. You don't preach — you spark curiosity. They ask. You answer. That's how it works.",
  },
  {
    icon: Crown,
    title: 'Identity',
    description: "You're not confused about who you are. Chosen. Called. Commissioned. Your clothes should reflect that. Not hide it.",
  },
  {
    icon: Flame,
    title: 'Conviction',
    description: "No apologies. No compromise. You believe what you believe. Now dress like it. If that offends someone — good.",
  },
];

const ValuesPillars = () => {
  return (
    <section className="py-16 md:py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-4">
            We don't stand for: Hiding. Blending in. Playing it safe.
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-foreground">
            What We Do Stand For
          </h2>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="group p-8 border border-border hover:border-amber-500/50 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="mb-6">
                <pillar.icon className="w-10 h-10 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-light text-foreground mb-4 tracking-wide">
                {pillar.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground font-light leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesPillars;
