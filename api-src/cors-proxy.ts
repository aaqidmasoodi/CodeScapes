import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"
import { rateLimiters } from "./lib/rateLimit"
import { assertPublicUrl, isAllowedOrigin, SsrfError, MAX_REDIRECTS } from "./lib/security"

/**
 * CORS Proxy for Python HTTP Requests
 *
 * This serverless function fetches external URLs server-side,
 * bypassing browser CORS restrictions. Used by the Python runtime
 * to enable `requests.get()` for any external URL.
 *
 * SECURITY:
 *  - Requires a valid Supabase JWT, OR an exact-matched trusted origin.
 *  - Validates the target URL against SSRF (private/reserved/metadata IPs),
 *    re-checking every redirect hop.
 *  - Never forwards the caller's Authorization header to the target.
 */

// Maximum response size (10MB)
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  // ================================================================
  // SECURITY: Rate Limiting (60 requests per minute per IP)
  // ================================================================
  try {
    const { success, limit, remaining, reset } = await rateLimiters.corsProxy(req)
    res.setHeader("X-RateLimit-Limit", limit.toString())
    res.setHeader("X-RateLimit-Remaining", remaining.toString())
    res.setHeader("X-RateLimit-Reset", reset.toString())

    if (!success) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      })
    }
  } catch (err) {
    console.error("Rate limiting error:", err)
  }

  // ================================================================
  // SECURITY: Authentication (preferred) or trusted-origin fallback
  // ================================================================
  const authHeader = req.headers.authorization
  let isAuthenticated = false

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const accessToken = authHeader.replace("Bearer ", "")
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      })

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      isAuthenticated = !authError && !!user
    }
  }

  // If not authenticated, validate request origin (exact match). Sandboxed
  // iframes / Web Workers may send "null" or no Origin, which we allow here
  // because the runtime calls this proxy from a worker context.
  if (!isAuthenticated) {
    const origin = (req.headers.origin || req.headers.referer || "") as string
    if (!isAllowedOrigin(origin, /* allowNullOrigin */ true)) {
      console.warn(`CORS Proxy blocked: unauthorized origin ${origin}`)
      return res.status(403).json({ error: "Unauthorized origin" })
    }
  }

  // ================================================================
  // Validate target URL (SSRF-safe)
  // ================================================================
  const targetUrl = req.query.url
  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).json({ error: "Missing 'url' query parameter" })
  }

  try {
    await assertPublicUrl(targetUrl)
  } catch (err) {
    if (err instanceof SsrfError) {
      return res.status(err.status).json({ error: err.message })
    }
    return res.status(400).json({ error: "Invalid URL" })
  }

  try {
    // NOTE: We intentionally do NOT forward the caller's Authorization header
    // to the target — that would leak the user's Supabase JWT to arbitrary
    // third-party servers.
    const headers: HeadersInit = {
      "User-Agent": "CodeScapes-Proxy/1.0",
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

    // Follow redirects manually so each hop is re-validated against SSRF rules.
    let currentUrl = targetUrl
    let response: Response | null = null
    try {
      for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        response = await fetch(currentUrl, {
          method: req.method === "POST" ? "POST" : "GET",
          headers,
          body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
          redirect: "manual",
          signal: controller.signal,
        })

        // Not a redirect — we're done.
        if (response.status < 300 || response.status >= 400) break

        const location = response.headers.get("location")
        if (!location) break // redirect without target — treat as final response

        const nextUrl = new URL(location, currentUrl).toString()
        await assertPublicUrl(nextUrl) // throws SsrfError if the hop is unsafe
        currentUrl = nextUrl

        if (hop === MAX_REDIRECTS) {
          clearTimeout(timeout)
          return res.status(508).json({ error: "Too many redirects" })
        }
      }
    } finally {
      clearTimeout(timeout)
    }

    if (!response) {
      return res.status(502).json({ error: "No response from target" })
    }

    // Check response size via Content-Length header
    const contentLength = response.headers.get("content-length")
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
      return res.status(413).json({ error: "Response too large" })
    }

    // Get response as buffer
    const buffer = await response.arrayBuffer()

    // Check actual size
    if (buffer.byteLength > MAX_RESPONSE_SIZE) {
      return res.status(413).json({ error: "Response too large" })
    }

    // Forward relevant headers
    const contentType = response.headers.get("content-type")
    if (contentType) {
      res.setHeader("Content-Type", contentType)
    }

    const cacheControl = response.headers.get("cache-control")
    if (cacheControl) {
      res.setHeader("Cache-Control", cacheControl)
    }

    // Set status and send buffer (use res.end for raw binary, not res.send)
    res.status(response.status)
    res.end(Buffer.from(buffer))
  } catch (error: unknown) {
    // A redirect hop pointing at an internal host surfaces here.
    if (error instanceof SsrfError) {
      return res.status(error.status).json({ error: error.message })
    }

    // Handle timeouts
    if (error instanceof Error && error.name === "AbortError") {
      return res.status(504).json({ error: "Request timeout" })
    }

    // Generic error
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("CORS Proxy error:", message)
    return res.status(500).json({ error: `Proxy error: ${message}` })
  }
}
