import { Clock, Calendar, Zap, MessageCircle, Mail, Phone, MessageSquare, Instagram, ExternalLink } from "lucide-react";
import ServicePageLayout from "@/components/service/ServicePageLayout";
import ServiceSection from "@/components/service/ServiceSection";
import InfoCard from "@/components/service/InfoCard";
import ActionCTA from "@/components/service/ActionCTA";
import DeclarationBlock from "@/components/accessibility/DeclarationBlock";
import ResponseCommitment from "@/components/contact/ResponseCommitment";
import OperatingHours from "@/components/contact/OperatingHours";
import ContactForm from "@/components/contact/ContactForm";
import { useToast } from "@/hooks/use-toast";

const heroValueProps = [
  { icon: Clock, text: "24h Response" },
  { icon: Calendar, text: "Mon–Sat Coverage" },
  { icon: Zap, text: "Order Priority" },
  { icon: MessageCircle, text: "Multi-Channel" },
];

const contactChannels = [
  {
    title: "EMAIL",
    description: "Best for detailed inquiries. Attach images, order info, or anything that helps us help you faster.",
    icon: Mail,
    iconColor: "emerald" as const,
    action: {
      label: "hello@lineofjudah.com",
      href: "mailto:hello@lineofjudah.com",
    },
  },
  {
    title: "HOTLINE",
    description: "Speak directly with the tribe. Best for urgent order issues or complex questions.",
    icon: Phone,
    iconColor: "blue" as const,
    action: {
      label: "+1 (212) 555-0123",
      href: "tel:+12125550123",
    },
  },
  {
    title: "LIVE CHAT",
    description: "Real-time support during business hours. Perfect for quick questions.",
    icon: MessageSquare,
    iconColor: "emerald" as const,
    action: {
      label: "Start Chat",
      onClick: true,
    },
  },
  {
    title: "SOCIAL",
    description: "DM us on Instagram for style advice, product questions, or just to connect.",
    icon: Instagram,
    iconColor: "blue" as const,
    action: {
      label: "@lineofjudah",
      href: "https://instagram.com/lineofjudah",
      external: true,
    },
  },
];

const priorityHotlines = [
  {
    subject: "Order Status",
    email: "orders@lineofjudah.com",
    response: "4-8 hours",
  },
  {
    subject: "Returns & Exchanges",
    email: "returns@lineofjudah.com",
    response: "24 hours",
  },
  {
    subject: "Size & Fit Help",
    email: "fit@lineofjudah.com",
    response: "12 hours",
  },
  {
    subject: "Accessibility",
    email: "accessibility@lineofjudah.com",
    response: "24 hours",
  },
  {
    subject: "Partnership / Press",
    email: "press@lineofjudah.com",
    response: "48-72 hours",
  },
];

const Contact = () => {
  const { toast } = useToast();
  
  const handleChatClick = () => {
    toast({
      title: "Live Chat",
      description: "Live chat is available Mon-Fri 9am-6pm ET. Check back during business hours.",
    });
  };
  
  return (
    <ServicePageLayout
      title="Direct Line to the Tribe."
      subtitle="Questions. Concerns. Battle reports. We're here. Response within 24 hours — faster for active orders."
      eyebrow="COMMAND CENTER"
      heroValueProps={heroValueProps}
      heroAlignment="center"
      showSidebar={true}
      showNewsletter={true}
    >
      {/* Response Commitment Strip */}
      <ResponseCommitment />
      
      {/* Declaration */}
      <div className="mt-12">
        <DeclarationBlock
          quote="We don't do bots. Every message reaches a real member of the tribe."
          attribution="Line of Judah Support Doctrine"
        />
      </div>
      
      {/* Communication Channels */}
      <ServiceSection
        id="channels"
        title="Communication Channels"
        subtitle="Choose your preferred method. All roads lead to the same dedicated team."
        className="mt-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactChannels.map((channel) => (
            <InfoCard
              key={channel.title}
              title={channel.title}
              description={channel.description}
              icon={channel.icon}
              iconColor={channel.iconColor}
            >
              {channel.action.onClick ? (
                <button
                  onClick={handleChatClick}
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors mt-4"
                >
                  {channel.action.label}
                </button>
              ) : channel.action.external ? (
                <a
                  href={channel.action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors mt-4"
                >
                  {channel.action.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <a
                  href={channel.action.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors mt-4"
                >
                  {channel.action.label}
                </a>
              )}
            </InfoCard>
          ))}
        </div>
      </ServiceSection>
      
      {/* Priority Hotlines */}
      <ServiceSection
        id="priority-hotlines"
        title="Priority Hotlines"
        subtitle="For specialized support, email directly with pre-formatted subject lines for faster routing."
        className="mt-16"
      >
        <div className="border border-border divide-y divide-border">
          {priorityHotlines.map((hotline) => (
            <div 
              key={hotline.subject}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="mb-2 sm:mb-0">
                <h4 className="font-medium">{hotline.subject}</h4>
                <a 
                  href={`mailto:${hotline.email}?subject=${encodeURIComponent(hotline.subject)}`}
                  className="text-sm text-amber-600 hover:text-amber-700 transition-colors"
                >
                  {hotline.email}
                </a>
              </div>
              <div className="text-sm text-muted-foreground">
                Response: <span className="text-foreground font-medium">{hotline.response}</span>
              </div>
            </div>
          ))}
        </div>
      </ServiceSection>
      
      {/* Operating Hours */}
      <ServiceSection
        id="hours"
        title="Operating Hours"
        subtitle="When each channel is staffed and ready."
        className="mt-16"
      >
        <div className="border border-border">
          <OperatingHours />
        </div>
      </ServiceSection>
      
      {/* Contact Form */}
      <ServiceSection
        id="form"
        title="Send a Transmission"
        subtitle="Fill out the form below and we'll route your message to the right team member."
        className="mt-16"
      >
        <div className="max-w-2xl">
          <ContactForm />
        </div>
      </ServiceSection>
      
      {/* Headquarters */}
      <ServiceSection
        id="headquarters"
        title="Headquarters"
        subtitle="Our base of operations."
        className="mt-16"
      >
        <div className="p-6 bg-muted/50 border border-border">
          <address className="not-italic space-y-1 text-sm">
            <p className="font-medium">Line of Judah, Inc.</p>
            <p className="text-muted-foreground">123 Faith Street, Suite 400</p>
            <p className="text-muted-foreground">Los Angeles, CA 90001</p>
            <p className="text-muted-foreground">United States</p>
          </address>
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            This is not a retail location. For product pickups or returns, please contact us first.
          </p>
        </div>
      </ServiceSection>
      
      {/* Urgent CTA */}
      <div className="mt-16">
        <ActionCTA
          title="Need Immediate Assistance?"
          subtitle="For time-sensitive order issues, call our hotline directly."
          buttonText="Call Now"
          alignment="center"
          footerLinks={[
            { text: "+1 (212) 555-0123", href: "tel:+12125550123" },
            { text: "Mon-Sat 9am-6pm ET", href: "#hours" },
          ]}
        />
      </div>
    </ServicePageLayout>
  );
};

export default Contact;
