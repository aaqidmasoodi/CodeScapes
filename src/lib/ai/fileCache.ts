/**
 * File Content Cache for Scapper
 *
 * Stores the latest known content of files to provide immediate context to the
 * LLM without re-reading. Injection is TOKEN-BUDGETED with LRU recency: the most
 * recently touched files are included first, up to a total character budget, so
 * the prompt can't grow unbounded as a project (or conversation) gets large.
 */

export const fileCache = new Map<string, string>()

// ~4 chars per token, so ~24k chars ≈ ~6k tokens of file context per turn.
const TOTAL_CHAR_BUDGET = 24000
const PER_FILE_LINE_CAP = 200

export function updateFileCache(path: string, content: string) {
  // Delete-then-set so the entry moves to the end of the Map (most-recently-used).
  fileCache.delete(path)
  fileCache.set(path, content)
}

export function getCachedFile(path: string): string | undefined {
  return fileCache.get(path)
}

export function clearFileCache() {
  fileCache.clear()
}

/**
 * Formats cached files into a context string for the LLM, newest-first, capped
 * at TOTAL_CHAR_BUDGET. Files that don't fit are listed as omitted so the model
 * knows to use read_file for them.
 */
export function formatFileCacheForPrompt(): string {
  if (fileCache.size === 0) return ""

  // Map iteration is insertion order; reverse => most-recently-used first.
  const entries = Array.from(fileCache.entries()).reverse()

  const included: { path: string; block: string }[] = []
  const omitted: string[] = []
  let used = 0

  for (const [path, content] of entries) {
    const lines = content.split("\n")
    let displayContent = content
    let note = ""
    if (lines.length > PER_FILE_LINE_CAP) {
      displayContent = lines.slice(0, PER_FILE_LINE_CAP).join("\n")
      note = `\n... (truncated ${lines.length - PER_FILE_LINE_CAP} more lines) ...`
    }

    const block = `\n--- FILE: ${path} ---\n${displayContent}${note}\n----------------\n`

    // Always include at least one file; otherwise respect the budget.
    if (included.length > 0 && used + block.length > TOTAL_CHAR_BUDGET) {
      omitted.push(path)
      continue
    }
    used += block.length
    included.push({ path, block })
  }

  // Display alphabetically for stability, even though selection was MRU.
  included.sort((a, b) => a.path.localeCompare(b.path))

  let output = "\n\n**CURRENT FILE CONTEXT (recently touched, cached)**:\n"
  output += included.map((e) => e.block).join("")
  if (omitted.length > 0) {
    output += `\n(${omitted.length} more file(s) omitted to stay within context budget — use read_file to view them: ${omitted
      .sort()
      .join(", ")})\n`
  }
  return output
}
