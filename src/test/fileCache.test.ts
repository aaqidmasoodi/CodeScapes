import { describe, it, expect, beforeEach } from "vitest"
import {
  fileCache,
  updateFileCache,
  getCachedFile,
  clearFileCache,
  formatFileCacheForPrompt,
} from "../lib/ai/fileCache"

describe("fileCache", () => {
  beforeEach(() => clearFileCache())

  it("returns empty string when nothing is cached", () => {
    expect(formatFileCacheForPrompt()).toBe("")
  })

  it("stores and retrieves content", () => {
    updateFileCache("a.js", "console.log(1)")
    expect(getCachedFile("a.js")).toBe("console.log(1)")
  })

  it("includes small files and lists them alphabetically", () => {
    updateFileCache("b.js", "b")
    updateFileCache("a.js", "a")
    const out = formatFileCacheForPrompt()
    expect(out).toContain("FILE: a.js")
    expect(out).toContain("FILE: b.js")
    // a.js block appears before b.js block (stable alphabetical display)
    expect(out.indexOf("FILE: a.js")).toBeLessThan(out.indexOf("FILE: b.js"))
  })

  it("re-inserting marks a file most-recently-used (LRU recency)", () => {
    updateFileCache("a.js", "a1")
    updateFileCache("b.js", "b1")
    updateFileCache("a.js", "a2") // a moves to newest
    const keys = Array.from(fileCache.keys())
    expect(keys[keys.length - 1]).toBe("a.js")
  })

  it("evicts oldest files when over the token budget and reports omissions", () => {
    // Two ~20k-char files exceed the 24k budget; only the most-recent fits.
    const big = "x".repeat(20000)
    updateFileCache("old.js", big) // least recent
    updateFileCache("new.js", big) // most recent -> included first

    const out = formatFileCacheForPrompt()
    expect(out).toContain("FILE: new.js")
    expect(out).toContain("omitted to stay within context budget")
    expect(out).toContain("old.js")
    expect(out).not.toContain("FILE: old.js")
  })

  it("truncates very long files by line count", () => {
    const manyLines = Array.from({ length: 500 }, (_, i) => `line ${i}`).join("\n")
    updateFileCache("long.js", manyLines)
    const out = formatFileCacheForPrompt()
    expect(out).toContain("truncated")
    expect(out).toContain("more lines")
  })
})
