import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"
import { rateLimiters } from "./lib/rateLimit"

/**
 * CORS Proxy for Python HTTP Requests
 *
 * This serverless function fetches external URLs server-side,
 * bypassing browser CORS restrictions. Used by the Python runtime
 * to enable `requests.get()` for any external URL.
 *
 * SECURITY: Requires Supabase JWT authentication.
 */

// Allowed URL schemes (prevent SSRF attacks)
const ALLOWED_SCHEMES = ["http:", "https:"]

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
  // SECURITY: Authentication (optional but preferred)
  // For Python runtime requests, we fall back to origin validation
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

  // If not authenticated, validate request origin
  if (!isAuthenticated) {
    const origin = req.headers.origin || req.headers.referer || ""
    const allowedOrigins = [
      "https://codescapes.io",
      "https://www.codescapes.io",
      "http://localhost:5173",
      "http://localhost:3000",
    ]

    const isAllowedOrigin = allowedOrigins.some((allowed) => origin.startsWith(allowed))

    if (!isAllowedOrigin) {
      console.warn(`CORS Proxy blocked: unauthorized origin ${origin}`)
      return res.status(403).json({ error: "Unauthorized origin" })
    }
  }

  // ================================================================
  // Validate target URL
  // ================================================================
  const targetUrl = req.query.url
  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).json({ error: "Missing 'url' query parameter" })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(targetUrl)
  } catch {
    return res.status(400).json({ error: "Invalid URL format" })
  }

  // Security: Only allow http/https
  if (!ALLOWED_SCHEMES.includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: "Only http and https URLs are allowed" })
  }

  // Security: Block localhost/internal IPs (basic SSRF protection)
  const hostname = parsedUrl.hostname.toLowerCase()
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname.endsWith(".local")
  ) {
    return res.status(403).json({ error: "Internal URLs are not allowed" })
  }

  try {
    // Prepare headers to forward (optional - can be expanded)
    const headers: HeadersInit = {
      "User-Agent": "CodeScapes-Proxy/1.0",
    }

    // Forward Authorization header if present (for authenticated APIs)
    const authHeader = req.headers.authorization
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    // Fetch the target URL
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

    const response = await fetch(targetUrl, {
      method: req.method === "POST" ? "POST" : "GET",
      headers,
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeout)

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

    // Forward cache headers if present
    const cacheControl = response.headers.get("cache-control")
    if (cacheControl) {
      res.setHeader("Cache-Control", cacheControl)
    }

    // Set status and send buffer
    res.status(response.status)
    res.send(Buffer.from(buffer))
  } catch (error: unknown) {
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
