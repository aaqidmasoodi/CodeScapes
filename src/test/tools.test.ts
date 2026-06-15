import { describe, it, expect, vi } from "vitest"
import { executeTool } from "../lib/ai/tools"
import type { ToolContext } from "../lib/ai/tools"

describe("AI Tools", () => {
  const mockContext: ToolContext = {
    scapeId: "test-scape",
    files: [
      { name: "empty.txt", language: "plaintext", content: "" },
      { name: "normal.txt", language: "plaintext", content: "Hello World" },
    ],
    createFile: vi.fn(),
    updateFile: vi.fn(),
    deleteFile: vi.fn(),
    environment: {
      id: "test-env",
      name: "Test Env",
      entryPoint: "main.py",
      capabilities: {},
    },
    dependencies: [],
  }

  describe("read_file", () => {
    it("should return content for normal files", async () => {
      const result = await executeTool("read_file", { path: "normal.txt" }, mockContext)
      expect(result.success).toBe(true)
      expect(result.output).toBe("Hello World")
    })

    it("should return explicit message for empty files", async () => {
      const result = await executeTool("read_file", { path: "empty.txt" }, mockContext)
      expect(result.success).toBe(true)
      // This is what we expect AFTER the fix
      expect(result.output).toBe("(File is empty)")
    })

    it("should return error for missing files", async () => {
      const result = await executeTool("read_file", { path: "missing.txt" }, mockContext)
      expect(result.success).toBe(false)
      expect(result.error).toContain("File not found")
    })
  })

  // Build a fresh, isolated context (write_file mutates ctx.files).
  function freshContext(files: { name: string; content: string }[] = []): ToolContext {
    return {
      scapeId: "test",
      files: files.map((f) => ({
        name: f.name,
        language: "plaintext",
        content: f.content,
      })) as ToolContext["files"],
      createFile: vi.fn(),
      updateFile: vi.fn(),
      deleteFile: vi.fn(),
      environment: { id: "web", name: "Web", entryPoint: "index.html", capabilities: {} },
      dependencies: [],
    }
  }

  describe("write_file (idempotent upsert)", () => {
    it("creates a file when it does not exist", async () => {
      const ctx = freshContext()
      const result = await executeTool(
        "write_file",
        { path: "index.html", content: "<html></html>" },
        ctx
      )
      expect(result.success).toBe(true)
      expect(result.output).toContain("Created")
      expect(ctx.createFile).toHaveBeenCalledOnce()
      expect(ctx.files.find((f) => f.name === "index.html")?.content).toBe("<html></html>")
    })

    it("overwrites a file when it already exists", async () => {
      const ctx = freshContext([{ name: "index.html", content: "old" }])
      const result = await executeTool("write_file", { path: "index.html", content: "new" }, ctx)
      expect(result.success).toBe(true)
      expect(result.output).toContain("Updated")
      expect(ctx.updateFile).toHaveBeenCalledWith("index.html", "new")
      expect(ctx.files.find((f) => f.name === "index.html")?.content).toBe("new")
    })

    it("create_file alias upserts an existing file WITHOUT failing (kills the retry dance)", async () => {
      const ctx = freshContext([{ name: "index.html", content: "template" }])
      const result = await executeTool(
        "create_file",
        { path: "index.html", content: "rewritten" },
        ctx
      )
      expect(result.success).toBe(true) // previously returned "File already exists"
      expect(ctx.files.find((f) => f.name === "index.html")?.content).toBe("rewritten")
    })

    it("overwrite_file alias creates a missing file instead of failing", async () => {
      const ctx = freshContext()
      const result = await executeTool("overwrite_file", { path: "new.js", content: "x" }, ctx)
      expect(result.success).toBe(true) // previously returned "File not found"
      expect(ctx.createFile).toHaveBeenCalledOnce()
    })

    it("rejects empty path", async () => {
      const ctx = freshContext()
      const result = await executeTool("write_file", { path: "", content: "x" }, ctx)
      expect(result.success).toBe(false)
    })
  })

  describe("attempt_completion", () => {
    it("returns success with the result as output", async () => {
      const ctx = freshContext()
      const result = await executeTool(
        "attempt_completion",
        { result: "Built the poker app." },
        ctx
      )
      expect(result.success).toBe(true)
      expect(result.output).toBe("Built the poker app.")
    })
  })
})
