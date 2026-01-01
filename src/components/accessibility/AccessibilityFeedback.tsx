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
    issue: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.issue) {
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
      title: "Thank you for your feedback",
      description: "We'll review your submission and respond within 2 business days."
    });
    
    setFormData({ name: "", email: "", issue: "" });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-light">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            className="h-11 font-light"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-light">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            className="h-11 font-light"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="issue" className="text-sm font-light">
          Describe the accessibility issue or suggestion
        </Label>
        <Textarea
          id="issue"
          value={formData.issue}
          onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
          placeholder="Please describe the issue you encountered or your suggestion for improvement..."
          rows={4}
          className="font-light resize-none"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="h-11 px-6"
      >
        {isSubmitting ? (
          "Sending..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </>
        )}
      </Button>
    </form>
  );
};

export default AccessibilityFeedback;
