/**
 * Scapper Context Builder
 *
 * Builds a concise project context for injection into the system prompt.
 * This helps Scapper understand the project structure without needing to call tools.
 */

import type { ScapeFile } from "@/types/file"
import { getMemories, formatMemoriesForPrompt } from "./memory"

export interface ProjectContext {
  fileTree: string
  dependencies: string
  memories: string
}

/**
 * Build a file tree string from files array
 * Output format:
 * index.html (html)
 * style.css (css)
 * js/
 *   main.js (javascript)
 *   utils.js (javascript)
 */
function buildFileTree(files: ScapeFile[]): string {
  // Filter out folders and sort
  const fileList = files
    .filter((f) => f.language !== "folder")
    .map((f) => f.name)
    .sort()

  if (fileList.length === 0) return "No files yet"

  // Group by directory
  const tree: Record<string, string[]> = { "": [] }

  for (const path of fileList) {
    const parts = path.split("/")
    if (parts.length === 1) {
      tree[""].push(path)
    } else {
      const dir = parts.slice(0, -1).join("/")
      const file = parts[parts.length - 1]
      if (!tree[dir]) tree[dir] = []
      tree[dir].push(file)
    }
  }

  // Format output
  const lines: string[] = []

  // Root files first
  for (const file of tree[""]) {
    const ext = file.split(".").pop()?.toLowerCase() || "unknown"
    lines.push(`${file} (${ext})`)
  }

  // Then directories
  const dirs = Object.keys(tree)
    .filter((d) => d !== "")
    .sort()
  for (const dir of dirs) {
    lines.push(`${dir}/`)
    for (const file of tree[dir]) {
      const ext = file.split(".").pop()?.toLowerCase() || "unknown"
      lines.push(`  ${file} (${ext})`)
    }
  }

  return lines.join("\n")
}

/**
 * Format dependencies for prompt
 */
function formatDependencies(dependencies: string[]): string {
  if (dependencies.length === 0) return "None"
  return dependencies.slice(0, 10).join(", ") + (dependencies.length > 10 ? "..." : "")
}

/**
 * Build complete project context for system prompt injection
 */
export async function buildProjectContext(
  scapeId: string,
  files: ScapeFile[],
  dependencies: string[] = []
): Promise<ProjectContext> {
  // Get memories (async)
  let memories = ""
  try {
    const memoryEntries = await getMemories(scapeId)
    memories = formatMemoriesForPrompt(memoryEntries)
  } catch (e) {
    console.warn("[Context] Failed to load memories:", e)
  }

  return {
    fileTree: buildFileTree(files),
    dependencies: formatDependencies(dependencies),
    memories,
  }
}

/**
 * Format context for injection into system prompt
 * Returns a compact string suitable for adding to the system message
 */
export function formatContextForPrompt(context: ProjectContext): string {
  const sections: string[] = []

  sections.push(`**Project Files:**\n\`\`\`\n${context.fileTree}\n\`\`\``)

  if (context.dependencies !== "None") {
    sections.push(`**Dependencies:** ${context.dependencies}`)
  }

  if (context.memories) {
    sections.push(context.memories)
  }

  return sections.join("\n\n")
}
