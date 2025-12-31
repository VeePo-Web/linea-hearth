import { Link } from "react-router-dom";

interface HowItMinistersProps {
  ministryStatement?: string | null;
  productName: string;
}

const HowItMinisters = ({ ministryStatement, productName }: HowItMinistersProps) => {
  const defaultStatement = `The ${productName} is more than fabric and thread—it's a daily declaration of your faith. Every time you put it on, you're choosing to walk boldly in purpose, carrying a message that speaks before you do.`;

  return (
    <section className="w-full py-16 lg:py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="aspect-[4/5] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden order-2 lg:order-1">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-10">✝</span>
            </div>
            {/* Placeholder for lifestyle image - would be dynamic per product */}
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-xs font-light text-muted-foreground uppercase tracking-widest">
                Faith in Action
              </p>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-6 order-1 lg:order-2">
            <p className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em]">
              The Purpose
            </p>
            <h2 className="text-2xl lg:text-3xl font-light text-foreground leading-tight">
              More Than A Shirt.<br />
              A Daily Declaration.
            </h2>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {ministryStatement || defaultStatement}
            </p>
            <p className="text-sm font-light text-muted-foreground leading-relaxed italic">
              "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven."
              <span className="not-italic block mt-1 text-xs">— Matthew 5:16</span>
            </p>
            <Link 
              to="/about/our-story"
              className="inline-block text-sm font-light text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Read Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItMinisters;
