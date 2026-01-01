import { useEffect } from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import ComplianceStatus from "@/components/accessibility/ComplianceStatus";
import AccessibilityFeatures from "@/components/accessibility/AccessibilityFeatures";
import AccessibilityFeedback from "@/components/accessibility/AccessibilityFeedback";
import { LegalSection, ImportantCallout } from "@/components/legal/LegalSection";

const Accessibility = () => {
  useEffect(() => {
    document.title = "Accessibility Statement - Linea Jewelry";
  }, []);

  return (
    <LegalPageLayout
      title="ACCESSIBLE TO ALL"
      subtitle="We're committed to making Linea Jewelry accessible to everyone, regardless of ability or technology."
      lastUpdated="January 2025"
    >
      {/* Compliance Status Badge */}
      <ComplianceStatus />

      {/* Our Commitment */}
      <LegalSection id="commitment" title="Our Commitment">
        <p>
          Linea Jewelry is committed to ensuring digital accessibility for people with 
          disabilities. We are continually improving the user experience for everyone and 
          applying the relevant accessibility standards to guarantee we provide equal access 
          to all users.
        </p>
        <p className="mt-4">
          We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA 
          standards. These guidelines explain how to make web content more accessible for 
          people with disabilities, and more user-friendly for everyone.
        </p>
      </LegalSection>

      {/* Accessibility Features */}
      <LegalSection id="features" title="Accessibility Features">
        <AccessibilityFeatures />
      </LegalSection>

      {/* Browser & Assistive Technology */}
      <LegalSection id="technology" title="Compatibility">
        <p>
          Our website is designed to be compatible with the following assistive technologies:
        </p>
        <ul className="mt-4 space-y-2">
          <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
          <li>Screen magnification software</li>
          <li>Speech recognition software</li>
          <li>Keyboard-only navigation</li>
        </ul>
        <p className="mt-4">
          We recommend using the latest version of your preferred browser for the best experience.
        </p>
      </LegalSection>

      {/* Known Limitations */}
      <LegalSection id="limitations" title="Known Limitations">
        <ImportantCallout>
          While we strive for full accessibility, some areas of our site may have limitations. 
          We are actively working to identify and resolve these issues.
        </ImportantCallout>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">User-Generated Content</h4>
            <p>
              Some customer reviews and community content may not have been created with 
              accessibility in mind. We moderate this content and add appropriate alternatives 
              where possible.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Third-Party Content</h4>
            <p>
              Some third-party tools and widgets (such as payment processors) may have 
              their own accessibility limitations. We select partners who share our 
              commitment to accessibility.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Feedback */}
      <LegalSection id="feedback" title="Help Us Improve">
        <p>
          We welcome your feedback on the accessibility of our website. If you encounter 
          any barriers or have suggestions for improvement, please let us know.
        </p>
        <AccessibilityFeedback />
      </LegalSection>

      {/* Contact */}
      <LegalSection id="contact" title="Accessibility Contact">
        <p>
          For immediate assistance or to report an accessibility issue, please contact us:
        </p>
        <div className="mt-4 space-y-1">
          <p className="text-foreground">Email: accessibility@lineajewelry.com</p>
          <p className="text-foreground">Phone: +1 (212) 555-0123</p>
        </div>
        <p className="mt-4">
          We aim to respond to accessibility feedback within 2 business days.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default Accessibility;
