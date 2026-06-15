ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_security_ack_at timestamptz;

ALTER TABLE public.ambassador_applications
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_security_ack_at timestamptz;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_ack_at timestamptz;