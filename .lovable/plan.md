# Sync Active Products to Stripe

Push all 16 active apparel products into the Lovable payments gateway (Stripe sandbox) so checkout can charge them by `price_id`. Store the resulting price ID on each product row for fast lookup.

## Step 1 — Add `stripe_price_id` to `products`

Migration adds one nullable column:
- `products.stripe_price_id text` (indexed) — populated after the batch sync, used by `create-checkout-session` to build line items.

## Step 2 — Batch create 16 products in Stripe

Single `batch_create_product` call (max 20 per batch, fits in one). Each product:
- `product_id` = product slug with underscores (e.g. `adam_god_mineral_wash_tee`)
- `product_name` = product name from DB
- `tax_code` = `txcd_99999999` (general tangible goods)
- One price:
  - `price_id` = `{product_id}_price`
  - `amount` = price in cents (CAD)
  - `currency` = `cad`
  - `quantity_min` = 1, `quantity_max` = 50

Prices to sync (CAD):

| Product | Price |
|---|---|
| Adam & God Mineral Wash Boxy Tee | $35 |
| Blessed Denim Baseball Cap | $30 |
| Burning Love Boxy Tee | $35 |
| Do you know Jesus Color Block Tee | $35 |
| Don't Forget the Poor Classic Knitted Tee | $70 |
| Faith in Fear Boxy Tee | $40 |
| First Love Mineral Wash Boxy Tee | $40 |
| First Love Snow Washed Hoodie | $40 |
| God Bless Line of Judah Sweater | $45 |
| Heavenly Khaki Baseball Cap | $30 |
| Ichthys Fish Sun-fade Hoodie | $50 |
| In Jesus Name Sun-fade Hoodie | $65 |
| Names of God Mineral Wash Tee | $35 |
| Revelation 3:20 Sun-fade Waffle Tee | $35 |
| Salvation Belongs Corduroy Cap | $30 |
| You Need Jesus Heavy Weight Hoodie | $50 |

## Step 3 — Backfill `stripe_price_id`

Insert migration mapping each product UUID → its new Stripe `price_id` string (using the deterministic `{slug}_price` convention from Step 2). This way `create-checkout-session` can `select stripe_price_id from products where id = ?`.

## Out of scope

- No description/image sync (slugs/names only — Stripe checkout uses our embedded UI)
- No subscription pricing
- No going live (sandbox only; auto-syncs to live on publish)

Confirm to run.