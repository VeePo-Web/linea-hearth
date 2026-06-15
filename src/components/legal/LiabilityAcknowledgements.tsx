import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type AckVariant = "account" | "ambassador" | "checkout";

interface AckRow {
  key: string;
  /** One-line label shown next to the checkbox. */
  short: React.ReactNode;
  /** Full legal text revealed when the user expands "Read more". */
  full: React.ReactNode;
}

const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;

const ACCOUNT_SECURITY: AckRow = {
  key: "accountSecurity",
  short: <>I accept the account security terms.</>,
  full: (
    <>
      I am solely responsible for keeping my login credentials secure.{" "}
      <strong className="font-medium">Line of Judah is not liable</strong> for any
      loss, damage, or unauthorized activity resulting from my account being accessed
      or compromised.
    </>
  ),
};

const TERMS_PRIVACY: AckRow = {
  key: "termsPrivacy",
  short: <>I agree to the Terms of Service and Privacy Policy.</>,
  full: (
    <>
      I have access to and accept the{" "}
      <Link
        to="/terms-of-service"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline underline-offset-2 hover:opacity-80"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        to="/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline underline-offset-2 hover:opacity-80"
      >
        Privacy Policy
      </Link>
      . I understand my data is handled per these terms.
    </>
  ),
};

const AMBASSADOR_TERMS: AckRow = {
  key: "termsPrivacy",
  short: <>I agree to the Terms, Privacy Policy, and Ambassador review.</>,
  full: (
    <>
      I accept the{" "}
      <Link
        to="/terms-of-service"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline underline-offset-2 hover:opacity-80"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        to="/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline underline-offset-2 hover:opacity-80"
      >
        Privacy Policy
      </Link>
      , and understand my application is subject to review and approval at the sole
      discretion of Line of Judah.
    </>
  ),
};

const PAYMENT_ACK: AckRow = {
  key: "paymentLiability",
  short: <>I accept the payment & liability terms.</>,
  full: (
    <>
      All payment and card information is processed and stored by{" "}
      <strong className="font-medium">Stripe, Inc.</strong> under its own terms.
      Line of Judah does not collect, store, or have access to my card data and is{" "}
      <strong className="font-medium">not liable</strong> for issues arising from
      payment processing, fraud, or unauthorized card use. I also agree to the{" "}
      <Link
        to="/terms-of-service"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline underline-offset-2 hover:opacity-80"
      >
        Terms
      </Link>{" "}
      and{" "}
      <Link
        to="/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline underline-offset-2 hover:opacity-80"
      >
        Privacy Policy
      </Link>
      .
    </>
  ),
};

const VARIANT_ROWS: Record<AckVariant, AckRow[]> = {
  account: [ACCOUNT_SECURITY, TERMS_PRIVACY],
  ambassador: [ACCOUNT_SECURITY, AMBASSADOR_TERMS],
  checkout: [PAYMENT_ACK],
};

export function getRequiredKeys(variant: AckVariant): string[] {
  return VARIANT_ROWS[variant].map((r) => r.key);
}

export function areAllAccepted(
  variant: AckVariant,
  values: Record<string, boolean>,
): boolean {
  return getRequiredKeys(variant).every((k) => values[k] === true);
}

export function initialAckValues(variant: AckVariant): Record<string, boolean> {
  return Object.fromEntries(getRequiredKeys(variant).map((k) => [k, false]));
}

interface Props {
  variant: AckVariant;
  values: Record<string, boolean>;
  onChange: (key: string, checked: boolean) => void;
  className?: string;
  /** Use dark/inverted styling (forms over a dark background, e.g. ambassador form). */
  inverted?: boolean;
}

export default function LiabilityAcknowledgements({
  variant,
  values,
  onChange,
  className,
  inverted = false,
}: Props) {
  const rows = VARIANT_ROWS[variant];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div
      className={cn(
        "space-y-2 border p-3 rounded-none",
        inverted
          ? "border-background/20 bg-background/[0.03]"
          : "border-border bg-muted/20",
        className,
      )}
      role="group"
      aria-label="Required acknowledgements"
    >
      {rows.map((row) => {
        const id = `ack-${variant}-${row.key}`;
        const checked = !!values[row.key];
        const isOpen = !!expanded[row.key];
        return (
          <div key={row.key} className="flex flex-col">
            <div className="flex items-start gap-3 min-h-[36px]">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(v) => onChange(row.key, v === true)}
                className={cn(
                  "mt-0.5 rounded-none data-[state=checked]:bg-accent data-[state=checked]:border-accent",
                  inverted ? "border-background/40" : "border-foreground/40",
                )}
              />
              <label
                htmlFor={id}
                className={cn(
                  "flex-1 text-xs leading-relaxed select-none cursor-pointer",
                  inverted ? "text-background/85" : "text-foreground/85",
                )}
              >
                {row.short}
                <span className={inverted ? "text-background/50" : "text-muted-foreground"}> *</span>
              </label>
              <button
                type="button"
                onClick={() => setExpanded((p) => ({ ...p, [row.key]: !p[row.key] }))}
                aria-expanded={isOpen}
                aria-controls={`${id}-detail`}
                className={cn(
                  "text-[11px] tracking-wide underline underline-offset-2 hover:opacity-80 shrink-0",
                  inverted ? "text-background/60" : "text-muted-foreground",
                )}
              >
                {isOpen ? "Show less" : "Read more"}
              </button>
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-detail`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: editorialEase }}
                  className="overflow-hidden"
                >
                  <p
                    className={cn(
                      "mt-2 ml-7 pr-2 text-[11px] leading-relaxed",
                      inverted ? "text-background/65" : "text-muted-foreground",
                    )}
                  >
                    {row.full}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
