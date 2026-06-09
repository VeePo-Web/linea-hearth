// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Pulls live product/category slugs from Supabase REST so the sitemap stays current.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://lineofjudah.clothing";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://harckavibhmimndfvnyo.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcmNrYXZpYmhtaW1uZGZ2bnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTc2MjksImV4cCI6MjA4Mjc3MzYyOX0.f2rddthwiJMqa3h4a1jl1Um5hvN6Xso0Knk1rL2cHqQ";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().split("T")[0];

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
  { path: "/home", changefreq: "weekly", priority: "0.9", lastmod: today },
  { path: "/catalogue", changefreq: "daily", priority: "0.9", lastmod: today },
  { path: "/lookbook", changefreq: "weekly", priority: "0.8", lastmod: today },
  { path: "/about/our-story", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/about/our-mission", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/about/size-guide", changefreq: "monthly", priority: "0.6", lastmod: today },
  { path: "/community", changefreq: "weekly", priority: "0.6", lastmod: today },
  { path: "/worn-in-the-wild", changefreq: "weekly", priority: "0.6", lastmod: today },
  { path: "/ambassador", changefreq: "monthly", priority: "0.6", lastmod: today },
  { path: "/contact", changefreq: "monthly", priority: "0.5", lastmod: today },
  { path: "/faq", changefreq: "monthly", priority: "0.5", lastmod: today },
  { path: "/shipping", changefreq: "monthly", priority: "0.5", lastmod: today },
  { path: "/returns", changefreq: "monthly", priority: "0.5", lastmod: today },
  { path: "/accessibility", changefreq: "yearly", priority: "0.3", lastmod: today },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3", lastmod: today },
  { path: "/terms-of-service", changefreq: "yearly", priority: "0.3", lastmod: today },
];

async function fetchFromSupabase<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`sitemap: Supabase ${path} returned ${res.status}, skipping`);
      return [];
    }
    return (await res.json()) as T[];
  } catch (e) {
    console.warn(`sitemap: Supabase fetch failed for ${path}, skipping`, e);
    return [];
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const products = await fetchFromSupabase<{ slug: string; updated_at: string }>(
    "products?select=slug,updated_at&status=eq.active&order=updated_at.desc",
  );
  const categories = await fetchFromSupabase<{ slug: string }>(
    "categories?select=slug",
  );

  const productEntries: SitemapEntry[] = products.map((p) => ({
    path: `/product/${p.slug}`,
    lastmod: p.updated_at ? p.updated_at.split("T")[0] : today,
    changefreq: "weekly",
    priority: "0.8",
  }));

  const categoryEntries: SitemapEntry[] = [
    { path: "/category/all", changefreq: "daily", priority: "0.7", lastmod: today },
    ...categories.map((c) => ({
      path: `/category/${c.slug}`,
      changefreq: "daily" as const,
      priority: "0.7",
      lastmod: today,
    })),
  ];

  const entries = [...staticEntries, ...categoryEntries, ...productEntries];

  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(
    `sitemap.xml written: ${entries.length} entries (${productEntries.length} products, ${categoryEntries.length} categories)`,
  );
}

main().catch((e) => {
  console.error("sitemap generation failed:", e);
  process.exit(0); // don't block dev/build on sitemap failure
});
