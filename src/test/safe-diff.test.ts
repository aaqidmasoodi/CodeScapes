import { describe, it, expect } from "vitest"
import { applySafeChanges } from "../lib/ai/safe-diff"

describe("applySafeChanges", () => {
  it("applies an exact single-line change", () => {
    const result = applySafeChanges("a\nb\nc", [{ search: "b", replace: "B" }])
    expect(result.success).toBe(true)
    expect(result.newContent).toBe("a\nB\nc")
  })

  it("fails cleanly (rollback) when the text is genuinely absent", () => {
    const result = applySafeChanges("a\nb\nc", [{ search: "zzz", replace: "X" }])
    expect(result.success).toBe(false)
    expect(result.newContent).toBe("a\nb\nc") // unchanged
    expect(result.failedChanges[0].reason).toContain("Text not found")
  })

  it("matches a block whose indentation differs (whitespace-tolerant)", () => {
    const content = `.box {
        color: red;
        font-size: 12px;
}`
    // Same block, different indentation than the file — exact match would fail.
    const search = `.box {
  color: red;
  font-size: 12px;
}`
    const replace = `.box {
  color: blue;
  font-size: 14px;
}`
    const result = applySafeChanges(content, [{ search, replace }])
    expect(result.success).toBe(true)
    expect(result.newContent).toContain("color: blue")
    expect(result.newContent).toContain("font-size: 14px")
  })

  it("uses the whitespace fallback even for large blocks (fuzzy matcher is skipped >1000 chars)", () => {
    // Build a >1000-char block so diff-match-patch fuzzy matching is skipped,
    // forcing the whole-line whitespace-tolerant path.
    const lines = Array.from({ length: 80 }, (_, i) => `property-${i}: value-${i};`)
    const content = lines.map((l) => `        ${l}`).join("\n") // 8-space indent
    const search = lines.map((l) => `  ${l}`).join("\n") // 2-space indent
    expect(search.length).toBeGreaterThan(1000)

    const result = applySafeChanges(content, [{ search, replace: "/* replaced */" }])
    expect(result.success).toBe(true)
    expect(result.newContent).toBe("/* replaced */")
  })
})
