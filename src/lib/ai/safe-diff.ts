/**
 * Safe Diff Utilities
 *
 * Uses diff-match-patch for robust text patching with fuzzy matching.
 * This is safer than line-number-based edits because it requires
 * the exact text to be replaced, preventing accidental overwrites.
 */

import DiffMatchPatch from "diff-match-patch"

// Create a single instance for reuse
const dmp = new DiffMatchPatch()

// Configure fuzzy matching (0 = exact, 1 = very loose)
dmp.Match_Threshold = 0.4 // Allow some fuzzy matching but not too loose
dmp.Match_Distance = 1000 // Search distance for fuzzy matching

/**
 * A single search/replace change
 */
export interface SafeChange {
  search: string // Exact text to find
  replace: string // Text to replace with
}

/**
 * Result of applying changes
 */
export interface SafeDiffResult {
  success: boolean
  newContent: string
  appliedChanges: number
  failedChanges: { search: string; reason: string }[]
}

/**
 * Apply a list of search/replace changes to content.
 * Each search must match exactly (or fuzzily within threshold).
 * If any change fails, the entire operation can be rolled back.
 *
 * @param content Original content
 * @param changes List of search/replace changes
 * @param options Optional configuration
 * @returns Result with new content or errors
 */
export function applySafeChanges(
  content: string,
  changes: SafeChange[],
  options?: {
    allowPartial?: boolean // If true, apply successful changes even if some fail
    fuzzyMatch?: boolean // If true, use fuzzy matching (default: true)
  }
): SafeDiffResult {
  const { allowPartial = false, fuzzyMatch = true } = options || {}

  let workingContent = content
  let appliedCount = 0
  const failures: { search: string; reason: string }[] = []

  for (const change of changes) {
    if (!change.search || change.search.trim() === "") {
      failures.push({ search: "(empty)", reason: "Empty search string" })
      continue
    }

    // Try exact match first
    const exactIndex = workingContent.indexOf(change.search)

    if (exactIndex !== -1) {
      // Exact match found - replace it
      workingContent =
        workingContent.slice(0, exactIndex) +
        change.replace +
        workingContent.slice(exactIndex + change.search.length)
      appliedCount++
      continue
    }

    // Try fuzzy match if enabled
    // Note: diff-match-patch uses browser regex which has max pattern length
    const MAX_PATTERN_LENGTH = 1000 // Conservative limit to avoid browser issues

    if (fuzzyMatch && change.search.length <= MAX_PATTERN_LENGTH) {
      try {
        const fuzzyIndex = dmp.match_main(workingContent, change.search, 0)

        if (fuzzyIndex !== -1) {
          // Fuzzy match found - we need to figure out the actual matched length
          // For safety, we'll use the search length and verify similarity
          const potentialMatch = workingContent.slice(fuzzyIndex, fuzzyIndex + change.search.length)
          const diffs = dmp.diff_main(change.search, potentialMatch)
          const levenshtein = dmp.diff_levenshtein(diffs)

          // Only accept if similarity is high enough (< 20% different)
          if (levenshtein < change.search.length * 0.2) {
            workingContent =
              workingContent.slice(0, fuzzyIndex) +
              change.replace +
              workingContent.slice(fuzzyIndex + change.search.length)
            appliedCount++
            continue
          }
        }
      } catch (e) {
        // Pattern too long or other regex error - fall through to failure
        console.warn("[SafeDiff] Fuzzy match failed:", e)
      }
    }

    // Whitespace-tolerant fallback: match whole lines ignoring indentation /
    // trailing whitespace. This is the most common reason an LLM-supplied diff
    // fails exact matching (e.g. CSS blocks where indentation differs).
    const wsMatch = findWhitespaceTolerantMatch(workingContent, change.search)
    if (wsMatch) {
      workingContent =
        workingContent.slice(0, wsMatch.start) + change.replace + workingContent.slice(wsMatch.end)
      appliedCount++
      continue
    }

    // No match found
    failures.push({
      search: change.search.slice(0, 50) + (change.search.length > 50 ? "..." : ""),
      reason: "Text not found in file",
    })
  }

  // Determine success
  const success = failures.length === 0 || (allowPartial && appliedCount > 0)

  // If not allowing partial and there are failures, rollback
  if (!allowPartial && failures.length > 0) {
    return {
      success: false,
      newContent: content, // Return original
      appliedChanges: 0,
      failedChanges: failures,
    }
  }

  return {
    success,
    newContent: workingContent,
    appliedChanges: appliedCount,
    failedChanges: failures,
  }
}

/**
 * Find a whole-line block in `content` that matches `search` ignoring each
 * line's leading/trailing whitespace. Returns the exact char span to replace,
 * or null if no such block exists. Handles the common LLM diff failure where
 * indentation differs from the real file.
 */
function findWhitespaceTolerantMatch(
  content: string,
  search: string
): { start: number; end: number } | null {
  const searchLines = search.split("\n")
  // Drop leading/trailing blank lines from the search block.
  while (searchLines.length && searchLines[0].trim() === "") searchLines.shift()
  while (searchLines.length && searchLines[searchLines.length - 1].trim() === "") searchLines.pop()
  if (searchLines.length === 0) return null

  const trimmedSearch = searchLines.map((l) => l.trim())
  const contentLines = content.split("\n")

  // Char offset of the start of each content line.
  const lineOffsets: number[] = []
  let offset = 0
  for (const line of contentLines) {
    lineOffsets.push(offset)
    offset += line.length + 1 // +1 for the newline
  }

  for (let i = 0; i + trimmedSearch.length <= contentLines.length; i++) {
    let matched = true
    for (let j = 0; j < trimmedSearch.length; j++) {
      if (contentLines[i + j].trim() !== trimmedSearch[j]) {
        matched = false
        break
      }
    }
    if (matched) {
      const lastIdx = i + trimmedSearch.length - 1
      return {
        start: lineOffsets[i],
        end: lineOffsets[lastIdx] + contentLines[lastIdx].length, // exclude trailing newline
      }
    }
  }
  return null
}

/**
 * Create a patch from two versions of content.
 * This can be used to generate patches for review.
 */
export function createPatch(original: string, modified: string): string {
  const diffs = dmp.diff_main(original, modified)
  dmp.diff_cleanupSemantic(diffs)
  const patches = dmp.patch_make(original, diffs)
  return dmp.patch_toText(patches)
}

/**
 * Apply a patch to content (from createPatch output).
 * Returns the patched content and whether it applied cleanly.
 */
export function applyPatch(
  content: string,
  patchText: string
): { success: boolean; content: string; cleanApply: boolean } {
  const patches = dmp.patch_fromText(patchText)
  const [newContent, results] = dmp.patch_apply(patches, content)

  // Check if all patches applied cleanly
  const cleanApply = results.every((r) => r)

  return {
    success: true,
    content: newContent,
    cleanApply,
  }
}

/**
 * Validate that a search string exists in content.
 * Returns the line number if found, or -1 if not found.
 */
export function findSearchLocation(
  content: string,
  search: string
): { found: boolean; lineNumber: number; fuzzy: boolean } {
  // Try exact match
  const exactIndex = content.indexOf(search)
  if (exactIndex !== -1) {
    const lineNumber = content.slice(0, exactIndex).split("\n").length
    return { found: true, lineNumber, fuzzy: false }
  }

  // Try fuzzy match (only if pattern is short enough for browser regex)
  const MAX_PATTERN_LENGTH = 1000
  if (search.length <= MAX_PATTERN_LENGTH) {
    try {
      const fuzzyIndex = dmp.match_main(content, search, 0)
      if (fuzzyIndex !== -1) {
        const lineNumber = content.slice(0, fuzzyIndex).split("\n").length
        return { found: true, lineNumber, fuzzy: true }
      }
    } catch {
      // Pattern too long or regex error - not found
    }
  }

  return { found: false, lineNumber: -1, fuzzy: false }
}
