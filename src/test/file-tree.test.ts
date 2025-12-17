import { describe, it, expect } from "vitest"
import { buildFileTree } from "@/lib/file-tree"
import type { ScapeFile } from "@/types/file"

describe("buildFileTree", () => {
  it("should handle an empty list", () => {
    const result = buildFileTree([])
    expect(result).toEqual([])
  })

  it("should create a flat list of files", () => {
    const files: ScapeFile[] = [
      { id: "1", name: "index.html", language: "html", content: "" },
      { id: "2", name: "style.css", language: "css", content: "" },
    ]
    const result = buildFileTree(files)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe("index.html")
    expect(result[1].name).toBe("style.css")
  })

  it("should nest files inside folders", () => {
    const files: ScapeFile[] = [
      { id: "1", name: "src", language: "folder", content: "" },
      { id: "2", name: "src/main.ts", language: "javascript", content: "" },
    ]
    // Note: The input to buildFileTree currently expects the folder to exist explicitly if we want it to be a folder type node

    const result = buildFileTree(files as ScapeFile[])
    expect(result).toHaveLength(1)

    const srcNode = result[0]
    expect(srcNode.name).toBe("src")
    expect(srcNode.type).toBe("folder")
    expect(srcNode.children).toHaveLength(1)
    expect(srcNode.children![0].name).toBe("main.ts")
  })

  it("should implicitly create folder nodes if they are missing from the flat list", () => {
    // This tests robustness: what if 'src' isn't in the list but 'src/main.ts' is?
    // Our current implementation might put it at root or create implicit folder.
    // Let's verify current behavior.
    const files: ScapeFile[] = [
      { id: "1", name: "components/Button.tsx", language: "javascript", content: "" },
    ]
    const result = buildFileTree(files)

    // Expectation depends on implementation.
    // If implementation handles implicit folders, we should see 'components' -> 'Button.tsx'.
    // If not, it might show 'components/Button.tsx' as a flat file or fail.
    // Based on previous code reading, it splits by '/'.

    expect(result[0].name).toBe("components")
    expect(result[0].type).toBe("folder")
    expect(result[0].children![0].name).toBe("Button.tsx")
  })

  it("should sort folders before files", () => {
    const files: ScapeFile[] = [
      { id: "1", name: "utils.js", language: "javascript", content: "" },
      { id: "2", name: "assets", language: "folder", content: "" },
    ]
    const result = buildFileTree(files)

    expect(result[0].name).toBe("assets") // folder first
    expect(result[1].name).toBe("utils.js")
  })
})
