import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * CORS Proxy for Python HTTP Requests
 *
 * This serverless function fetches external URLs server-side,
 * bypassing browser CORS restrictions. Used by the Python runtime
 * to enable `requests.get()` for any external URL.
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

  // Get target URL from query parameter
  const targetUrl = req.query.url
  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).json({ error: "Missing 'url' query parameter" })
  }

  // Validate URL
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
