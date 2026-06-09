import { Helmet } from "react-helmet-async";

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "product";
  image?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

/**
 * Per-route SEO head. Renders nothing visible — only mutates <head>.
 * Use on every public route to ensure unique title, description, canonical,
 * and Open Graph metadata (avoiding duplicate sitewide tags from index.html).
 */
const PageSEO = ({
  title,
  description,
  path,
  type = "website",
  image,
  jsonLd,
  noindex = false,
}: PageSEOProps) => {
  const url = `https://lineofjudah.clothing${path}`;
  const ogImage = image || "https://lineofjudah.clothing/og-home.png";
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageSEO;
