import type { ScapeFile } from "@/types/file"

// ============================================================================
// Types
// ============================================================================

export interface SearchOptions {
  caseSensitive?: boolean
  regex?: boolean
  wholeWord?: boolean
  maxResultsPerFile?: number
  maxTotalResults?: number
}

export interface SearchMatch {
  line: number // 1-indexed
  column: number // 0-indexed
  length: number // Length of the match
  lineContent: string // Full line content
  matchText: string // The actual matched text
}

export interface FileSearchResult {
  file: ScapeFile
  matches: SearchMatch[]
}

export interface SearchResults {
  results: FileSearchResult[]
  totalMatches: number
  truncated: boolean // True if results were capped
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if file content is binary (not searchable text)
 */
function isBinaryContent(content: ScapeFile["content"]): boolean {
  return content instanceof Blob || content instanceof ArrayBuffer || content instanceof Uint8Array
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Build regex pattern from search query and options
 */
function buildPattern(query: string, options: SearchOptions): RegExp | null {
  if (!query) return null

  let pattern = query

  // If not using regex, escape special characters
  if (!options.regex) {
    pattern = escapeRegex(pattern)
  }

  // Wrap with word boundaries if whole word matching
  if (options.wholeWord) {
    pattern = `\\b${pattern}\\b`
  }

  try {
    const flags = options.caseSensitive ? "g" : "gi"
    return new RegExp(pattern, flags)
  } catch {
    // Invalid regex
    return null
  }
}

// ============================================================================
// Main Search Function
// ============================================================================

/**
 * Search for text across multiple files
 *
 * @param files - Array of ScapeFile objects to search
 * @param query - Search query (plain text or regex)
 * @param options - Search options
 * @returns Structured search results
 */
export function searchFiles(
  files: ScapeFile[],
  query: string,
  options: SearchOptions = {}
): SearchResults {
  const { maxResultsPerFile = 100, maxTotalResults = 500 } = options

  const pattern = buildPattern(query, options)
  if (!pattern) {
    return { results: [], totalMatches: 0, truncated: false }
  }

  const results: FileSearchResult[] = []
  let totalMatches = 0
  let truncated = false

  for (const file of files) {
    // Skip binary files silently
    if (isBinaryContent(file.content)) continue

    // Skip folders
    if (file.language === "folder") continue

    const content = file.content as string
    const lines = content.split("\n")
    const matches: SearchMatch[] = []

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const lineContent = lines[lineIndex]

      // Reset regex lastIndex for each line
      pattern.lastIndex = 0

      let match: RegExpExecArray | null
      while ((match = pattern.exec(lineContent)) !== null) {
        // Check limits
        if (matches.length >= maxResultsPerFile) {
          truncated = true
          break
        }
        if (totalMatches >= maxTotalResults) {
          truncated = true
          break
        }

        matches.push({
          line: lineIndex + 1, // 1-indexed
          column: match.index,
          length: match[0].length,
          lineContent: lineContent,
          matchText: match[0],
        })
        totalMatches++

        // Prevent infinite loop for zero-width matches
        if (match[0].length === 0) {
          pattern.lastIndex++
        }
      }

      if (truncated) break
    }

    if (matches.length > 0) {
      results.push({ file, matches })
    }

    if (truncated) break
  }

  return { results, totalMatches, truncated }
}

// ============================================================================
// Replace Functions
// ============================================================================

export interface ReplaceResult {
  file: ScapeFile
  newContent: string
  replacementCount: number
}

/**
 * Replace all matches in a single file's content
 */
export function replaceInFile(
  content: string,
  query: string,
  replacement: string,
  options: SearchOptions = {}
): { newContent: string; count: number } {
  const pattern = buildPattern(query, options)
  if (!pattern) {
    return { newContent: content, count: 0 }
  }

  let count = 0
  const newContent = content.replace(pattern, () => {
    count++
    return replacement
  })

  return { newContent, count }
}

/**
 * Replace all occurrences across multiple files
 */
export function replaceInFiles(
  files: ScapeFile[],
  query: string,
  replacement: string,
  options: SearchOptions = {}
): ReplaceResult[] {
  const results: ReplaceResult[] = []

  for (const file of files) {
    // Skip binary files
    if (isBinaryContent(file.content)) continue
    if (file.language === "folder") continue

    const content = file.content as string
    const { newContent, count } = replaceInFile(content, query, replacement, options)

    if (count > 0) {
      results.push({
        file,
        newContent,
        replacementCount: count,
      })
    }
  }

  return results
}

/**
 * Replace a single match at a specific location
 */
export function replaceSingleMatch(
  content: string,
  match: SearchMatch,
  replacement: string
): string {
  const lines = content.split("\n")
  const lineIndex = match.line - 1 // Convert to 0-indexed

  if (lineIndex < 0 || lineIndex >= lines.length) {
    return content
  }

  const line = lines[lineIndex]
  const before = line.substring(0, match.column)
  const after = line.substring(match.column + match.length)
  lines[lineIndex] = before + replacement + after

  return lines.join("\n")
}
