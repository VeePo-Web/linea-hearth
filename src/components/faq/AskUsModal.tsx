import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { useToast } from "@/hooks/use-toast";

interface AskUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AskUsModal = ({ isOpen, onClose }: AskUsModalProps) => {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Question submitted",
      description: "We'll get back to you within 24 hours.",
    });
    
    // Reset after delay
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail("");
      setOrderNumber("");
      setQuestion("");
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">Ask Us a Question</DialogTitle>
          <DialogDescription className="font-light">
            Can't find what you're looking for? We'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <DrawCheckIcon size="lg" className="text-green-600 dark:text-green-400" delay={100} />
            </div>
            <h3 className="text-xl font-light mb-2">Question Submitted!</h3>
            <p className="text-muted-foreground font-light">
              We'll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-light">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderNumber" className="font-light">
                Order Number <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="orderNumber"
                type="text"
                placeholder="#LOJ-12345"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question" className="font-light">Your Question *</Label>
              <Textarea
                id="question"
                placeholder="How can we help you?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Question
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground font-light">
                or email us directly at{" "}
                <a 
                  href="mailto:hello@lineofjudah.com" 
                  className="text-amber-600 hover:underline"
                >
                  hello@lineofjudah.com
                </a>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AskUsModal;
