import { describe, it, expect } from "vitest"
import {
  isAllowedOrigin,
  isPrivateIp,
  assertPublicUrl,
  SsrfError,
} from "../../api-src/lib/security"
import { isNewUserPrompt } from "../../api-src/scapper-proxy"

describe("isAllowedOrigin", () => {
  it("accepts exact trusted origins", () => {
    expect(isAllowedOrigin("https://codescapes.io")).toBe(true)
    expect(isAllowedOrigin("https://www.codescapes.io")).toBe(true)
    expect(isAllowedOrigin("http://localhost:5173")).toBe(true)
  })

  it("reduces a Referer URL to its origin", () => {
    expect(isAllowedOrigin("https://codescapes.io/community/scape/abc")).toBe(true)
  })

  it("rejects suffix/prefix lookalike origins (the old startsWith bug)", () => {
    expect(isAllowedOrigin("https://codescapes.io.evil.com")).toBe(false)
    expect(isAllowedOrigin("https://evil-codescapes.io")).toBe(false)
    expect(isAllowedOrigin("https://staging.codescapes.io.attacker.net")).toBe(false)
  })

  it("does NOT treat empty/null origin as allowed by default", () => {
    expect(isAllowedOrigin("")).toBe(false)
    expect(isAllowedOrigin(undefined)).toBe(false)
    expect(isAllowedOrigin("null")).toBe(false)
  })

  it("allows empty/null origin only when explicitly opted in (worker traffic)", () => {
    expect(isAllowedOrigin("", true)).toBe(true)
    expect(isAllowedOrigin("null", true)).toBe(true)
    // ...but still rejects genuinely bad origins even with the opt-in
    expect(isAllowedOrigin("https://evil.com", true)).toBe(false)
  })
})

describe("isPrivateIp", () => {
  it("flags loopback, private, CGNAT and link-local IPv4", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true)
    expect(isPrivateIp("10.0.0.5")).toBe(true)
    expect(isPrivateIp("172.16.0.1")).toBe(true)
    expect(isPrivateIp("172.31.255.255")).toBe(true)
    expect(isPrivateIp("192.168.1.1")).toBe(true)
    expect(isPrivateIp("100.64.0.1")).toBe(true)
    expect(isPrivateIp("0.0.0.0")).toBe(true)
  })

  it("flags the cloud metadata endpoint", () => {
    expect(isPrivateIp("169.254.169.254")).toBe(true)
  })

  it("allows genuinely public IPv4 (incl. 172.32+ which the old check wrongly blocked)", () => {
    expect(isPrivateIp("1.1.1.1")).toBe(false)
    expect(isPrivateIp("8.8.8.8")).toBe(false)
    expect(isPrivateIp("172.32.0.1")).toBe(false)
  })

  it("flags loopback, ULA, link-local and IPv4-mapped IPv6", () => {
    expect(isPrivateIp("::1")).toBe(true)
    expect(isPrivateIp("::")).toBe(true)
    expect(isPrivateIp("fd00::1")).toBe(true)
    expect(isPrivateIp("fe80::1")).toBe(true)
    expect(isPrivateIp("::ffff:127.0.0.1")).toBe(true)
  })

  it("returns false for non-IP strings", () => {
    expect(isPrivateIp("example.com")).toBe(false)
  })
})

describe("assertPublicUrl", () => {
  it("rejects non-http(s) schemes", async () => {
    await expect(assertPublicUrl("ftp://example.com")).rejects.toBeInstanceOf(SsrfError)
    await expect(assertPublicUrl("file:///etc/passwd")).rejects.toBeInstanceOf(SsrfError)
  })

  it("rejects internal/metadata IP literals", async () => {
    await expect(assertPublicUrl("http://127.0.0.1/")).rejects.toBeInstanceOf(SsrfError)
    await expect(assertPublicUrl("http://169.254.169.254/latest/meta-data")).rejects.toBeInstanceOf(
      SsrfError
    )
    await expect(assertPublicUrl("http://[::1]/")).rejects.toBeInstanceOf(SsrfError)
  })

  it("rejects localhost and internal-suffix hostnames", async () => {
    await expect(assertPublicUrl("http://localhost:8080")).rejects.toBeInstanceOf(SsrfError)
    await expect(assertPublicUrl("http://db.internal/")).rejects.toBeInstanceOf(SsrfError)
  })

  it("accepts a public IP literal", async () => {
    await expect(assertPublicUrl("https://1.1.1.1/")).resolves.toBeInstanceOf(URL)
  })

  it("rejects malformed URLs", async () => {
    await expect(assertPublicUrl("not a url")).rejects.toBeInstanceOf(SsrfError)
  })
})

describe("isNewUserPrompt (server-authoritative quota)", () => {
  it("counts a turn ending in a user message", () => {
    expect(
      isNewUserPrompt([
        { role: "system", content: "..." },
        { role: "user", content: "make it red" },
      ])
    ).toBe(true)
  })

  it("does NOT count tool-loop continuations", () => {
    expect(
      isNewUserPrompt([
        { role: "user", content: "make it red" },
        { role: "assistant", content: null, tool_calls: [] },
        { role: "tool", content: "ok" },
      ])
    ).toBe(false)
  })

  it("rejects empty / non-array payloads", () => {
    expect(isNewUserPrompt([])).toBe(false)
    expect(isNewUserPrompt(undefined)).toBe(false)
    expect(isNewUserPrompt("nope")).toBe(false)
  })
})
