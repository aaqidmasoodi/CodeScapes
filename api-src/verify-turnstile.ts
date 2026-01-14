import type { VercelRequest, VercelResponse } from "@vercel/node"
import { rateLimiters } from "./lib/rateLimit"

/**
 * Turnstile Token Validation Endpoint
 *
 * Validates Cloudflare Turnstile tokens server-side.
 * This should be called before processing sensitive actions like signup/login.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // ================================================================
  // SECURITY: Rate Limiting (5 verifications per minute per IP)
  // ================================================================
  try {
    const { success, limit, remaining, reset } = await rateLimiters.auth(req)
    res.setHeader("X-RateLimit-Limit", limit.toString())
    res.setHeader("X-RateLimit-Remaining", remaining.toString())
    res.setHeader("X-RateLimit-Reset", reset.toString())

    if (!success) {
      return res.status(429).json({
        success: false,
        error: "Too many verification attempts",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      })
    }
  } catch (err) {
    console.error("Rate limiting error:", err)
  }

  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ success: false, error: "Missing token" })
    }

    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
    if (!secretKey) {
      console.error("CLOUDFLARE_TURNSTILE_SECRET_KEY not configured")
      return res.status(500).json({ success: false, error: "Server configuration error" })
    }

    // Validate token with Cloudflare
    const formData = new URLSearchParams()
    formData.append("secret", secretKey)
    formData.append("response", token)

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })

    const result = await response.json()

    if (result.success) {
      return res.status(200).json({ success: true })
    } else {
      console.warn("Turnstile validation failed:", result["error-codes"])
      return res.status(400).json({
        success: false,
        error: "Verification failed",
        codes: result["error-codes"],
      })
    }
  } catch (error) {
    console.error("Turnstile validation error:", error)
    return res.status(500).json({ success: false, error: "Validation error" })
  }
}
