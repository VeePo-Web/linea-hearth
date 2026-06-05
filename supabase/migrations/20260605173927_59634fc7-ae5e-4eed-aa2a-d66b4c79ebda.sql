ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS retry_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retry_email_followup_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retry_token TEXT,
  ADD COLUMN IF NOT EXISTS retry_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_retry_token_key
  ON public.orders(retry_token) WHERE retry_token IS NOT NULL;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status = ANY (ARRAY[
    'pending','processing','paid','shipped','delivered',
    'cancelled','refunded','expired','disputed'
  ]));

CREATE INDEX IF NOT EXISTS idx_orders_retry_eligible
  ON public.orders (payment_status, status, retry_email_sent_at)
  WHERE payment_status = 'unpaid';
