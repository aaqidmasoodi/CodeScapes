import { Helmet } from "react-helmet-async"

interface SeoHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article"
  author?: string
  jsonLd?: Record<string, unknown>
  keywords?: string[]
}

export function SeoHead({
  title = "CodeScapes - Your Code is a Masterpiece",
  description = "Create, visualize, and share your code as beautiful, interactive masterpieces directly in your browser.",
  image = "https://codescapes.io/og-image.png",
  url = "https://codescapes.io",
  type = "website",
  author = "CodeScapes",
  jsonLd,
  keywords,
}: SeoHeadProps) {
  const fullTitle = title.includes("CodeScapes") ? title : `${title} | CodeScapes`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(", ")} />}
      <meta name="author" content={author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="CodeScapes" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
