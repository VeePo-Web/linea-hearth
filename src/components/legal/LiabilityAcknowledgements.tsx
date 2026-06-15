import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type AckVariant = "account" | "ambassador" | "checkout";

interface AckRow {
  key: string;
  label: React.ReactNode;
}

const ACCOUNT_SECURITY: AckRow = {
  key: "accountSecurity",
  label: (
    <>
      <strong className="font-medium">Account security.</strong> I am solely responsible
      for keeping my login credentials secure. <strong className="font-medium">Line of
      Judah is not liable</strong> for any loss, damage, or unauthorized activity
      resulting from my account being accessed or compromised.
    </>
  ),
};

const TERMS_PRIVACY: AckRow = {
  key: "termsPrivacy",
  label: (
    <>
      I agree to the{" "}
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
      .
    </>
  ),
};

const AMBASSADOR_TERMS: AckRow = {
  key: "termsPrivacy",
  label: (
    <>
      I agree to the{" "}
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
      , and understand my application is subject to review and approval.
    </>
  ),
};

const PAYMENT_ACK: AckRow = {
  key: "paymentLiability",
  label: (
    <>
      <strong className="font-medium">Payment liability.</strong> All payment and card
      information is processed and stored by <strong className="font-medium">Stripe,
      Inc.</strong> under its own terms. Line of Judah does not collect, store, or have
      access to my card data and is not liable for issues arising from payment
      processing, fraud, or unauthorized card use. I agree to the{" "}
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

  return (
    <div
      className={cn(
        "space-y-3 border p-4 rounded-none",
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
        return (
          <label
            key={row.key}
            htmlFor={id}
            className="flex items-start gap-3 cursor-pointer min-h-[44px]"
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={(v) => onChange(row.key, v === true)}
              className={cn(
                "mt-0.5 rounded-none data-[state=checked]:bg-accent data-[state=checked]:border-accent",
                inverted ? "border-background/40" : "border-foreground/40",
              )}
            />
            <span
              className={cn(
                "text-xs leading-relaxed select-none",
                inverted ? "text-background/80" : "text-foreground/80",
              )}
            >
              {row.label}
              <span className={inverted ? "text-background/50" : "text-muted-foreground"}> *</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
