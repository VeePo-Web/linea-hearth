ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_email_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_pending_lookup
  ON public.orders (status, payment_status, created_at);