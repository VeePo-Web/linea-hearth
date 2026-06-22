/**
 * Admin-side money formatter. Store currency is locked to CAD.
 * Always renders amounts as `$X.XX CAD` so admin/ops staff can never
 * misread a number as USD. For chart axis ticks where horizontal space
 * is tight, use `formatAdminMoneyShort`.
 */
export const formatAdminMoney = (cents: number | null | undefined): string => {
  const v = ((cents ?? 0) / 100).toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${v} CAD`;
};

/** Compact form (no CAD suffix) for tight chart axis ticks. */
export const formatAdminMoneyShort = (cents: number | null | undefined): string => {
  const v = ((cents ?? 0) / 100).toLocaleString('en-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `$${v}`;
};

/** Locked store currency. Site rule: strictly CAD. */
export const STORE_CURRENCY = {
  code: 'CAD' as const,
  label: 'Canadian Dollar',
  symbol: '$',
};
