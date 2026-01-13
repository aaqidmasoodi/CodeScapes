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
})
