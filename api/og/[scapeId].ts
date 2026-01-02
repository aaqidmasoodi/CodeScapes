import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

// Initialize Supabase client
// Note: In Vercel, we use non-VITE_ prefixed env vars for server-side code
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Common bot User-Agents for social media crawlers
const BOT_PATTERNS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "Slackbot",
  "Discordbot",
  "TelegramBot",
  "Googlebot",
  "bingbot",
  "Baiduspider",
  "DuckDuckBot",
  "Applebot",
  "Pinterest",
]

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false
  return BOT_PATTERNS.some((pattern) => userAgent.toLowerCase().includes(pattern.toLowerCase()))
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { scapeId } = req.query
  const userAgent = req.headers["user-agent"] || ""

  // For regular browsers, serve the SPA HTML
  // The client-side React router will handle the route
  if (!isBot(userAgent)) {
    try {
      // In Vercel's serverless environment, the built files are in .vercel/output/static
      // But we can also just return the raw HTML and let the browser handle it
      const indexPath = join(process.cwd(), "dist", "index.html")
      const html = readFileSync(indexPath, "utf-8")
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      return res.status(200).send(html)
    } catch {
      // Fallback: redirect to the SPA
      return res.redirect(307, "/")
    }
  }

  // Extract scape ID (handle array case)
  const id = Array.isArray(scapeId) ? scapeId[0] : scapeId

  if (!id) {
    return res.status(400).send("Missing scape ID")
  }

  try {
    // Fetch scape data from Supabase
    const { data, error } = await supabase
      .from("scapes")
      .select(
        `
        id,
        name,
        description,
        thumbnail,
        environment,
        author:profiles(
          full_name,
          username
        )
      `
      )
      .eq("id", id)
      .eq("is_public", true)
      .maybeSingle()

    if (error || !data) {
      // Fallback to default OG tags
      return res.status(200).send(generateDefaultHtml())
    }

    // Prepare OG data
    const title = escapeHtml(data.name || "CodeScapes Project")
    const description = escapeHtml(
      data.description || "A project built with CodeScapes - Browser-Based Code IDE"
    )
    // Supabase returns nested relations - handle both array and object forms
    const authorData = Array.isArray(data.author) ? data.author[0] : data.author
    const authorName = authorData?.full_name || authorData?.username || "CodeScapes User"
    const image = data.thumbnail || "https://codescapes.io/og-image.png"
    const url = `https://codescapes.io/community/scape/${id}`
    const environment = data.environment || "web"

    // Generate HTML with OG tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${title} | CodeScapes</title>
  <meta name="title" content="${title} | CodeScapes">
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:site_name" content="CodeScapes">
  <meta property="article:author" content="${escapeHtml(authorName)}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <!-- Additional Info -->
  <meta name="author" content="${escapeHtml(authorName)}">
  <meta name="keywords" content="CodeScapes, ${environment}, code, programming, ${title}">
  
  <!-- Redirect to actual page for any JS-enabled browsers -->
  <meta http-equiv="refresh" content="0;url=${url}">
  <link rel="canonical" href="${url}">
</head>
<body>
  <p>Loading ${title}...</p>
  <p><a href="${url}">Click here if you are not redirected</a></p>
</body>
</html>`

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate")
    return res.status(200).send(html)
  } catch (err) {
    console.error("OG handler error:", err)
    return res.status(200).send(generateDefaultHtml())
  }
}

function generateDefaultHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeScapes - Browser-Based Code IDE</title>
  <meta name="description" content="Create, code, and share interactive web projects directly in your browser.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="CodeScapes - Browser-Based Code IDE">
  <meta property="og:description" content="Create, code, and share interactive web projects directly in your browser.">
  <meta property="og:image" content="https://codescapes.io/og-image.png">
  <meta property="og:site_name" content="CodeScapes">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="CodeScapes - Browser-Based Code IDE">
  <meta name="twitter:description" content="Create, code, and share interactive web projects directly in your browser.">
  <meta name="twitter:image" content="https://codescapes.io/og-image.png">
</head>
<body>
  <p>Loading CodeScapes...</p>
</body>
</html>`
}
