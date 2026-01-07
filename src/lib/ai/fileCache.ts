/**
 * File Content Cache for Scapper
 *
 * Stores the latest known content of files to avoid redundant reads
 * and provide immediate context to the LLM.
 */

// Singleton cache instance (reset per session if needed, or kept alive)
// For now, we'll keep it simple: a global map that is cleared when the page reloads
// or explicitly reset.
export const fileCache = new Map<string, string>()

export function updateFileCache(path: string, content: string) {
  fileCache.set(path, content)
}

export function getCachedFile(path: string): string | undefined {
  return fileCache.get(path)
}

export function clearFileCache() {
  fileCache.clear()
}

/**
 * Formats the cached files into a context string for the LLM.
 * Limits to reasonable size to avoid blowing up context window.
 */
export function formatFileCacheForPrompt(): string {
  if (fileCache.size === 0) return ""

  let output = "\n\n**CURRENT FILE CONTEXT (Cached)**:\n"

  // Sort by name for stability
  const sortedFiles = Array.from(fileCache.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  for (const [path, content] of sortedFiles) {
    // Truncate huge files for context safety (e.g. 200 lines or 10k chars)
    const lines = content.split("\n")
    let displayContent = content
    let note = ""

    if (lines.length > 300) {
      displayContent = lines.slice(0, 300).join("\n")
      note = `\n... (truncated ${lines.length - 300} more lines) ...`
    }

    output += `\n--- FILE: ${path} ---\n${displayContent}${note}\n----------------\n`
  }

  return output
}
