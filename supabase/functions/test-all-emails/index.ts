// Test endpoint: send every email template to parker@veepo.ca for inbox QA.
// Reuses the production render functions so output matches what customers receive.

import { buildOrderConfirmationHtml } from "../send-order-confirmation/index.ts";
import { renderEmail as renderWornInvite } from "../process-worn-in-the-wild-invites/index.ts";
import {
  getEmail1Html,
  getEmail2Html,
  getEmail3Html,
} from "../process-abandoned-carts/index.ts";
import { buildEmail as buildReviewEmail } from "../process-review-requests/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_TO = "parker@veepo.ca";
const FROM = "Line of Judah <noreply@lineofjudah.com>";
const SITE_URL = "https://lineofjudah.clothing";

async function sendViaResend(apiKey: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [TEST_TO],
      subject: `[TEST] ${subject}`,
      html,
    }),
  });
  const text = await res.text();
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, body: parsed ?? text };
}

// ---- mock data ----
const mockOrder = {
  id: "abcdef12-3456-7890-abcd-ef1234567890",
  customer_email: TEST_TO,
  customer_first_name: "Parker",
  customer_last_name: "Test",
  shipping_address: {
    address: "123 King St W",
    city: "Toronto",
    state: "ON",
    postalCode: "M5H 1A1",
    country: "CA",
  },
  subtotal_cents: 17800,
  shipping_cents: 0,
  discount_cents: 0,
  total_cents: 17800,
  shipping_method: "Standard",
  discount_code: null,
  created_at: new Date().toISOString(),
  currency: "cad",
};

const mockOrderItems = [
  {
    id: "i1",
    product_name: "Armor Tee — Forest",
    product_image_url: "https://lineofjudah.clothing/og-image.jpg",
    variant_size: "L",
    variant_color: "Forest Green",
    quantity: 1,
    unit_price_cents: 8900,
    total_cents: 8900,
  },
  {
    id: "i2",
    product_name: "Anointed Hoodie — Chrome",
    product_image_url: "https://lineofjudah.clothing/og-image.jpg",
    variant_size: "M",
    variant_color: "Silver Chrome",
    quantity: 1,
    unit_price_cents: 8900,
    total_cents: 8900,
  },
];

const mockCart = {
  id: "cart-test-1",
  email: TEST_TO,
  cart_items: [
    {
      id: 1,
      name: "Armor Tee — Forest",
      price: 89,
      priceFormatted: "$89.00",
      image: "https://lineofjudah.clothing/og-image.jpg",
      quantity: 1,
      category: "tees",
      size: "L",
      color: "Forest Green",
    },
    {
      id: 2,
      name: "Anointed Hoodie — Chrome",
      price: 129,
      priceFormatted: "$129.00",
      image: "https://lineofjudah.clothing/og-image.jpg",
      quantity: 1,
      category: "hoodies",
      size: "M",
      color: "Silver Chrome",
    },
  ],
  cart_total: 218,
  recovery_token: "TEST_TOKEN",
  status: "abandoned",
  discount_code: "LOJ15-TEST00",
  created_at: new Date().toISOString(),
  email_1_sent_at: null,
  email_2_sent_at: null,
  email_3_sent_at: null,
};

const mockReviewOrder = {
  id: "rev-test-1",
  customer_email: TEST_TO,
  customer_first_name: "Parker",
  delivered_at: new Date().toISOString(),
  order_items: [
    {
      product_id: "p1",
      product_name: "Armor Tee — Forest",
      product_image_url: "https://lineofjudah.clothing/og-image.jpg",
    },
    {
      product_id: "p2",
      product_name: "Anointed Hoodie — Chrome",
      product_image_url: "https://lineofjudah.clothing/og-image.jpg",
    },
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const recoveryUrl = `${SITE_URL}/cart?recover=TEST_TOKEN`;
  const placeholderUnsubInject = (html: string) =>
    html.replace('href="#"', `href="${SITE_URL}/unsubscribe?test=1"`);

  const tests: Array<{ name: string; subject: string; html: string }> = [
    {
      name: "order-confirmation",
      subject: "Your Line of Judah order — confirmed",
      html: buildOrderConfirmationHtml(mockOrder as any, mockOrderItems as any, SITE_URL),
    },
    {
      name: "worn-in-the-wild-invite",
      subject: "Worn in the wild",
      html: renderWornInvite({
        firstName: "Parker",
        heroImage: "https://lineofjudah.clothing/og-image.jpg",
        productName: "Armor Tee — Forest",
        uploadUrl: `${SITE_URL}/worn/upload?t=TEST`,
      }),
    },
    {
      name: "abandoned-cart-1-gentle-reminder",
      subject: "You left something behind",
      html: placeholderUnsubInject(getEmail1Html(mockCart as any, recoveryUrl, SITE_URL)),
    },
    {
      name: "abandoned-cart-2-social-proof",
      subject: "Still thinking it over?",
      html: placeholderUnsubInject(getEmail2Html(mockCart as any, recoveryUrl, SITE_URL)),
    },
    {
      name: "abandoned-cart-3-discount",
      subject: "15% off — last call on your cart",
      html: placeholderUnsubInject(
        getEmail3Html(mockCart as any, recoveryUrl, "LOJ15-TEST00", SITE_URL),
      ),
    },
    (() => {
      const r = buildReviewEmail(mockReviewOrder as any, SITE_URL);
      return { name: "review-request", subject: r.subject, html: r.html };
    })(),
  ];

  const results: any[] = [];
  for (const t of tests) {
    try {
      const r = await sendViaResend(apiKey, t.subject, t.html);
      results.push({ template: t.name, ok: r.ok, status: r.status, response: r.body });
    } catch (e) {
      results.push({ template: t.name, ok: false, error: (e as Error).message });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  return new Response(
    JSON.stringify({ to: TEST_TO, total: tests.length, sent, failedCount: failed.length, results }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
