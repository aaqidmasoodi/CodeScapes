import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * Rate Limiter Utility for Vercel API Functions
 *
 * Uses Upstash Redis for distributed rate limiting.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
 *
 * This module is bundled into each API function by esbuild.
 */

// Create Redis client (lazy initialization)
let redis: Redis | null = null
function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn("[RateLimit] Upstash Redis not configured, rate limiting disabled")
    return null
  }

  redis = new Redis({ url, token })
  return redis
}

// Rate limiter instances (cached per prefix)
const limiters: Record<string, Ratelimit> = {}

/**
 * Get or create a rate limiter for a specific prefix
 */
function getLimiter(prefix: string, requests: number, window: string): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  const key = `${prefix}:${requests}:${window}`
  if (!limiters[key]) {
    limiters[key] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        requests,
        window as `${number} s` | `${number} m` | `${number} h`
      ),
      prefix: `ratelimit:${prefix}`,
      analytics: true,
    })
  }
  return limiters[key]
}

/**
 * Get client identifier from request
 * Prefers IP, falls back to auth token hash, then random ID
 */
function getClientId(req: { headers: { [key: string]: string | string[] | undefined } }): string {
  // Try various IP headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers["x-forwarded-for"]
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0]
    return ip.trim()
  }

  const realIp = req.headers["x-real-ip"]
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp
  }

  // Fallback: Use auth token prefix as identifier (for authenticated users)
  const auth = req.headers["authorization"]
  if (auth) {
    const token = Array.isArray(auth) ? auth[0] : auth
    // Use first 16 chars of token as identifier
    return `token:${token.substring(0, 16)}`
  }

  // Last resort: random ID (not ideal, but prevents total bypass)
  return `anon:${Math.random().toString(36).substring(2, 10)}`
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for a request
 */
export async function rateLimit(
  req: { headers: { [key: string]: string | string[] | undefined } },
  prefix: string,
  requests: number,
  window: string = "60 s"
): Promise<RateLimitResult> {
  const limiter = getLimiter(prefix, requests, window)

  // If rate limiting is disabled (no Redis), allow all requests
  if (!limiter) {
    return { success: true, limit: requests, remaining: requests, reset: 0 }
  }

  const clientId = getClientId(req)
  const result = await limiter.limit(clientId)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /** CORS Proxy: 60 requests per minute per IP */
  corsProxy: (req: { headers: { [key: string]: string | string[] | undefined } }) =>
    rateLimit(req, "cors-proxy", 60, "60 s"),

  /** Scapper AI: 10 requests per minute per user */
  scapperAi: (req: { headers: { [key: string]: string | string[] | undefined } }) =>
    rateLimit(req, "scapper-ai", 10, "60 s"),

  /** Auth/Turnstile: 5 attempts per minute per IP */
  auth: (req: { headers: { [key: string]: string | string[] | undefined } }) =>
    rateLimit(req, "auth", 5, "60 s"),
}
