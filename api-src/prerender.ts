import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BASE_URL = "https://codescapes.io"
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`

// Bot patterns - includes search engines AND social media crawlers
const BOT_PATTERNS = [
  // Search engines (CRITICAL for indexing)
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-Video",
  "Googlebot-News",
  "Storebot-Google",
  "Google-InspectionTool",
  "Bingbot",
  "bingbot",
  "msnbot",
  "Slurp", // Yahoo
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "Sogou",
  "Exabot",
  "ia_archiver", // Alexa

  // Social media crawlers
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "Slackbot",
  "Discordbot",
  "TelegramBot",
  "Applebot",
  "Pinterest",
  "Embedly",
  "Quora Link Preview",
  "Showyoubot",
  "outbrain",
  "vkShare",
  "W3C_Validator",
]

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern.toLowerCase()))
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Page-specific metadata
interface PageMeta {
  title: string
  description: string
  url: string
  image: string
  type: "website" | "article"
  jsonLd?: object
}

function getHomePageMeta(): PageMeta {
  return {
    title: "CodeScapes - Your Code is a Masterpiece",
    description:
      "Create, visualize, and share your code as beautiful, interactive masterpieces directly in your browser. Supports p5.js, Three.js, and Python turtle graphics.",
    url: BASE_URL,
    image: DEFAULT_OG_IMAGE,
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "CodeScapes",
      operatingSystem: "Web",
      applicationCategory: "DeveloperApplication",
      description:
        "A browser-based creative coding playground for p5.js, Three.js, and Python turtle graphics.",
      url: BASE_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  }
}

function getCommunityPageMeta(): PageMeta {
  return {
    title: "Community | CodeScapes",
    description:
      "Discover interactive coding projects created by the CodeScapes community. Browse, remix, and get inspired by creative code experiments.",
    url: `${BASE_URL}/community`,
    image: DEFAULT_OG_IMAGE,
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "CodeScapes Community Projects",
      description: "A gallery of creative coding projects built with CodeScapes.",
      url: `${BASE_URL}/community`,
    },
  }
}

async function getScapePageMeta(scapeId: string): Promise<PageMeta | null> {
  try {
    const { data, error } = await supabase
      .from("scapes")
      .select(
        `
        id,
        name,
        description,
        thumbnail,
        environment,
        updated_at,
        author:profiles(
          full_name,
          username
        )
      `
      )
      .eq("id", scapeId)
      .eq("is_public", true)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    const authorData = Array.isArray(data.author) ? data.author[0] : data.author
    const authorName = authorData?.full_name || authorData?.username || "CodeScapes User"

    return {
      title: `${data.name || "Untitled Scape"} | CodeScapes`,
      description:
        data.description ||
        `A ${data.environment || "creative"} coding project built with CodeScapes`,
      url: `${BASE_URL}/community/scape/${scapeId}`,
      image: data.thumbnail || DEFAULT_OG_IMAGE,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: data.name,
        description: data.description,
        url: `${BASE_URL}/community/scape/${scapeId}`,
        image: data.thumbnail || DEFAULT_OG_IMAGE,
        author: {
          "@type": "Person",
          name: authorName,
        },
        dateModified: data.updated_at,
      },
    }
  } catch (err) {
    console.error("Error fetching scape:", err)
    return null
  }
}

function generateHtml(meta: PageMeta): string {
  const escapedTitle = escapeHtml(meta.title)
  const escapedDescription = escapeHtml(meta.description)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapedTitle}</title>
  <meta name="title" content="${escapedTitle}">
  <meta name="description" content="${escapedDescription}">
  <meta name="author" content="CodeScapes">
  <meta name="robots" content="index, follow">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${meta.url}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${meta.type}">
  <meta property="og:url" content="${meta.url}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:image" content="${meta.image}">
  <meta property="og:site_name" content="CodeScapes">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${meta.url}">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDescription}">
  <meta name="twitter:image" content="${meta.image}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <meta name="theme-color" content="#10b981">
  
  <!-- Structured Data -->
  ${meta.jsonLd ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>` : ""}
</head>
<body>
  <h1>${escapedTitle}</h1>
  <p>${escapedDescription}</p>
  <p><a href="${meta.url}">Continue to CodeScapes</a></p>
</body>
</html>`
}

function generate404Html(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found | CodeScapes</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${BASE_URL}">
</head>
<body>
  <h1>Page Not Found</h1>
  <p>The requested page could not be found.</p>
  <p><a href="${BASE_URL}">Return to CodeScapes</a></p>
</body>
</html>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers["user-agent"] || ""
  const path = req.url?.split("?")[0] || "/"

  // For regular browsers, serve the SPA
  if (!isBot(userAgent)) {
    try {
      const indexPath = join(process.cwd(), "dist", "index.html")
      const html = readFileSync(indexPath, "utf-8")
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      return res.status(200).send(html)
    } catch {
      return res.redirect(307, "/")
    }
  }

  // For bots, serve pre-rendered HTML with proper meta tags
  let meta: PageMeta | null = null

  // Route matching
  if (path === "/" || path === "") {
    meta = getHomePageMeta()
  } else if (path === "/community" || path === "/community/") {
    meta = getCommunityPageMeta()
  } else if (path.startsWith("/community/scape/")) {
    const scapeId = path.replace("/community/scape/", "").replace(/\/$/, "")
    if (scapeId) {
      meta = await getScapePageMeta(scapeId)
    }
  }

  // If no meta found, check query params (for backwards compatibility with og?scapeId=)
  if (!meta && req.query.scapeId) {
    const scapeId = Array.isArray(req.query.scapeId) ? req.query.scapeId[0] : req.query.scapeId
    meta = await getScapePageMeta(scapeId)
  }

  // Handle 404 for bots
  if (!meta) {
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    return res.status(404).send(generate404Html())
  }

  // Send pre-rendered HTML
  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400")
  return res.status(200).send(generateHtml(meta))
}
