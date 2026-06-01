-- Recreate size_confidence_stats view without SECURITY DEFINER property
-- (PG 15+ default is security_invoker = on, but explicit is safer)
DROP VIEW IF EXISTS public.size_confidence_stats;

CREATE VIEW public.size_confidence_stats
WITH (security_invoker = true) AS
WITH order_sizes AS (
  SELECT o.user_id,
         oi.variant_size,
         p.category_id,
         c.slug AS category_slug,
         CASE
           WHEN c.slug ILIKE ANY (ARRAY['%tops%','%tees%','%hoodies%','%crewnecks%','%shirts%','%jackets%','%outerwear%','%sweatshirts%']) THEN 'tops'
           WHEN c.slug ILIKE ANY (ARRAY['%bottoms%','%shorts%','%joggers%','%pants%','%jeans%','%trousers%']) THEN 'bottoms'
           WHEN c.slug ILIKE ANY (ARRAY['%hats%','%beanies%','%caps%','%headwear%','%snapbacks%']) THEN 'hats'
           ELSE 'other'
         END AS size_type,
         o.fulfillment_status,
         1 AS order_count
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  LEFT JOIN products p ON oi.product_id = p.id
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE o.user_id IS NOT NULL
    AND oi.variant_size IS NOT NULL
    AND o.payment_status = 'paid'
)
SELECT user_id,
       size_type,
       variant_size AS size,
       count(*) AS total_orders,
       count(*) FILTER (WHERE fulfillment_status IN ('fulfilled','delivered')) AS successful_orders,
       round((count(*) FILTER (WHERE fulfillment_status IN ('fulfilled','delivered'))::numeric
              / NULLIF(count(*), 0)::numeric) * 100, 0) AS confidence_percentage
FROM order_sizes
WHERE size_type <> 'other'
GROUP BY user_id, size_type, variant_size;

GRANT SELECT ON public.size_confidence_stats TO authenticated;
GRANT SELECT ON public.size_confidence_stats TO service_role;