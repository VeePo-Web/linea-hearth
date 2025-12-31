import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WearTheMissionCTA = () => {
  return (
    <section className="py-16 md:py-24 px-6 bg-amber-500">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-4">
          Ready to Wear the Mission?
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-foreground/80 font-light mb-8">
          Join 10K+ believers wearing their faith boldly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-foreground text-amber-500 hover:bg-foreground/90 rounded-none px-8 py-6 text-base font-light tracking-wide group"
          >
            <Link to="/category/all">
              Shop the Collection
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Link
            to="/about/customer-care"
            className="text-foreground/70 hover:text-foreground underline underline-offset-4 text-sm font-light transition-colors"
          >
            Read Customer Stories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WearTheMissionCTA;
