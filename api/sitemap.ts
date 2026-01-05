import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Fetch all public scapes
    // We select ID and updated_at (or created_at) to populate the sitemap
    const { data: scapes, error } = await supabase
      .from("scapes")
      .select("id, updated_at")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })

    if (error) {
      throw error
    }

    // 2. Build XML
    // Base URL
    const baseUrl = "https://codescapes.io"

    // Static pages
    const staticPages = [
      "",
      "/community",
      "/about", // if exists
    ]

    const staticXml = staticPages
      .map((path) => {
        return `
  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
  </url>`
      })
      .join("")

    // Dynamic pages (Scapes)
    const dynamicXml = (scapes || [])
      .map((scape) => {
        return `
  <url>
    <loc>${baseUrl}/community/scape/${scape.id}</loc>
    <lastmod>${new Date(scape.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      })
      .join("")

    // 3. Combine
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${dynamicXml}
</urlset>`

    // 4. Send response
    res.setHeader("Content-Type", "application/xml")
    // Cache for 1 hour
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate")
    return res.status(200).send(sitemap)
  } catch (err: unknown) {
    console.error("Sitemap generation error:", err)
    return res.status(500).send(`Error generating sitemap: ${(err as Error).message}`)
  }
}
