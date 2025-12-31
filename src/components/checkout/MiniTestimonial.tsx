import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "The craftsmanship is exceptional. I get compliments every time I wear it.",
    author: "Sarah M.",
    location: "London"
  },
  {
    quote: "Worth every penny. The quality speaks for itself.",
    author: "James K.",
    location: "Paris"
  },
  {
    quote: "Stunning pieces that become instant heirlooms.",
    author: "Emma L.",
    location: "New York"
  }
];

const MiniTestimonial = () => {
  // Rotate testimonial based on current hour to add variety
  const currentIndex = new Date().getHours() % testimonials.length;
  const testimonial = testimonials[currentIndex];

  return (
    <div className="bg-muted/30 p-4 mt-6 border-l-2 border-amber-400">
      <div className="flex gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-foreground italic mb-2">
        "{testimonial.quote}"
      </p>
      <p className="text-xs text-muted-foreground">
        — {testimonial.author}, {testimonial.location}
      </p>
    </div>
  );
};

export default MiniTestimonial;
