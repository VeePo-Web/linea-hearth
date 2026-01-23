import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const AccessibilityFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.description) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Barrier report received",
      description: "Our team will respond within 48 hours."
    });
    
    setFormData({ name: "", email: "", description: "" });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="feedback-name" className="text-sm font-medium">
            Name
          </Label>
          <Input
            id="feedback-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            className="h-11 font-light rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback-email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="feedback-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            className="h-11 font-light rounded-none"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback-description" className="text-sm font-medium">
          Barrier Description
        </Label>
        <Textarea
          id="feedback-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the barrier you encountered..."
          rows={5}
          className="font-light resize-none rounded-none"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium tracking-wide"
      >
        {isSubmitting ? (
          "SUBMITTING..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
            REPORT BARRIER
          </>
        )}
      </Button>
    </form>
  );
};

export default AccessibilityFeedback;
