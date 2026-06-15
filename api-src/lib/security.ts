import { isIP } from "node:net"
import { lookup } from "node:dns/promises"

/**
 * Shared security helpers for Vercel API functions.
 *
 * - Exact-match origin allowlisting (no prefix matching, no empty-string wildcard)
 * - SSRF-safe URL validation (scheme + private/reserved IP rejection with DNS
 *   resolution and redirect re-validation)
 *
 * This module is bundled into each API function by esbuild.
 */

/**
 * Browser/app origins that are allowed to call our proxy endpoints WITHOUT a
 * valid Supabase JWT. Matched EXACTLY — never via startsWith — to avoid
 * `https://codescapes.io.evil.com` style bypasses.
 */
export const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  "https://codescapes.io",
  "https://www.codescapes.io",
  "https://staging.codescapes.io",
  "http://localhost:5173",
  "http://localhost:3000",
])

/**
 * Returns true if the given Origin/Referer is allowed.
 *
 * Sandboxed iframes and Web Workers may legitimately send `"null"` or no origin
 * at all; we allow those ONLY when explicitly opted in (the proxy endpoints do
 * this for worker traffic). An empty/missing origin is NOT implicitly trusted.
 */
export function isAllowedOrigin(rawOrigin: string | undefined, allowNullOrigin = false): boolean {
  const origin = (rawOrigin || "").trim()

  if (origin === "") {
    return allowNullOrigin
  }
  if (origin === "null") {
    return allowNullOrigin
  }

  // A Referer is a full URL (may include a path); reduce it to its origin.
  let candidate = origin
  try {
    candidate = new URL(origin).origin
  } catch {
    // Not a parseable URL (e.g. already a bare origin) — compare as-is.
  }

  return ALLOWED_ORIGINS.has(candidate)
}

// ---------------------------------------------------------------------------
// SSRF protection
// ---------------------------------------------------------------------------

const ALLOWED_SCHEMES = new Set(["http:", "https:"])

/** Maximum redirects we will follow while re-validating each hop. */
export const MAX_REDIRECTS = 5

/**
 * Returns true if an IP literal points at a private, loopback, link-local,
 * carrier-grade-NAT, or otherwise reserved address. Covers the cloud metadata
 * endpoint (169.254.169.254) via the link-local range.
 */
export function isPrivateIp(ip: string): boolean {
  const family = isIP(ip)
  if (family === 0) return false // not an IP literal

  if (family === 4) return isPrivateIPv4(ip)
  return isPrivateIPv6(ip)
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number(p))
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true // malformed — treat as unsafe
  }
  const [a, b] = parts

  if (a === 0) return true // 0.0.0.0/8 "this network"
  if (a === 10) return true // 10.0.0.0/8 private
  if (a === 127) return true // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true // 169.254.0.0/16 link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12 private
  if (a === 192 && b === 168) return true // 192.168.0.0/16 private
  if (a === 100 && b >= 64 && b <= 127) return true // 100.64.0.0/10 CGNAT
  if (a >= 224) return true // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved

  return false
}

function isPrivateIPv6(rawIp: string): boolean {
  const ip = rawIp.toLowerCase().replace(/^\[|\]$/g, "")

  if (ip === "::1" || ip === "::") return true // loopback / unspecified

  // IPv4-mapped / IPv4-compatible addresses (e.g. ::ffff:127.0.0.1)
  const mapped = ip.match(/(?:::ffff:)?(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIPv4(mapped[1])

  const firstHextet = ip.split(":")[0]
  if (firstHextet.startsWith("fc") || firstHextet.startsWith("fd")) return true // fc00::/7 ULA
  if (firstHextet.startsWith("fe8") || firstHextet.startsWith("fe9")) return true // fe80::/10
  if (firstHextet.startsWith("fea") || firstHextet.startsWith("feb")) return true // fe80::/10
  if (firstHextet.startsWith("ff")) return true // ff00::/8 multicast

  return false
}

export class SsrfError extends Error {
  readonly status: number

  constructor(message: string, status = 403) {
    super(message)
    this.name = "SsrfError"
    this.status = status
  }
}

/**
 * Validates that a URL is safe to fetch server-side:
 *   1. Scheme must be http/https.
 *   2. If the host is an IP literal, it must be public.
 *   3. Otherwise resolve the hostname and reject if ANY resolved address is
 *      private/reserved (defends against DNS-based SSRF).
 *
 * Throws SsrfError on any violation.
 */
export async function assertPublicUrl(targetUrl: string): Promise<URL> {
  let parsed: URL
  try {
    parsed = new URL(targetUrl)
  } catch {
    throw new SsrfError("Invalid URL format", 400)
  }

  if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
    throw new SsrfError("Only http and https URLs are allowed", 400)
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "")

  if (hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new SsrfError("Internal URLs are not allowed")
  }

  // Host is a literal IP — validate directly, no DNS needed.
  if (isIP(hostname) !== 0) {
    if (isPrivateIp(hostname)) {
      throw new SsrfError("Internal URLs are not allowed")
    }
    return parsed
  }

  // Hostname — resolve every address and reject if any is private.
  let addresses: { address: string }[]
  try {
    addresses = await lookup(hostname, { all: true })
  } catch {
    throw new SsrfError("Could not resolve host", 400)
  }

  if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
    throw new SsrfError("Internal URLs are not allowed")
  }

  return parsed
}
