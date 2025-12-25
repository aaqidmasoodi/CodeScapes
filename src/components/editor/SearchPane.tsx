import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  Search,
  Replace,
  ChevronRight,
  ChevronDown,
  FileCode,
  CaseSensitive,
  Regex,
  WholeWord,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  searchFiles,
  replaceInFile,
  replaceInFiles,
  replaceSingleMatch,
  type SearchOptions,
  type FileSearchResult,
  type SearchMatch,
} from "@/lib/search"
import type { ScapeFile } from "@/types/file"

// ============================================================================
// Types
// ============================================================================

interface SearchPaneProps {
  files: ScapeFile[]
  onNavigate: (fileName: string, line?: number) => void
  onUpdateFile: (fileName: string, content: string) => void
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function SearchPane({ files, onNavigate, onUpdateFile, className }: SearchPaneProps) {
  // Search state
  const [query, setQuery] = useState("")
  const [replacement, setReplacement] = useState("")
  const [showReplace, setShowReplace] = useState(false)

  // Options
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)

  // UI state - track expanded files
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  // Build search options
  const options: SearchOptions = useMemo(
    () => ({
      caseSensitive,
      regex: useRegex,
      wholeWord,
      maxResultsPerFile: 100,
      maxTotalResults: 500,
    }),
    [caseSensitive, useRegex, wholeWord]
  )

  // Perform search
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return { results: [], totalMatches: 0, truncated: false }
    }
    return searchFiles(files, query, options)
  }, [files, query, options])

  // Check if file should be expanded (auto-expand single file result)
  const isFileExpanded = useCallback(
    (fileName: string) => {
      // Auto-expand if only 1 file with results
      if (searchResults.results.length === 1) {
        return true
      }
      return expandedFiles.has(fileName)
    },
    [expandedFiles, searchResults.results.length]
  )

  // Toggle file expansion
  const toggleFile = useCallback((fileName: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(fileName)) {
        next.delete(fileName)
      } else {
        next.add(fileName)
      }
      return next
    })
  }, [])

  // Handle result click
  const handleMatchClick = useCallback(
    (fileName: string, line: number) => {
      onNavigate(fileName, line)
    },
    [onNavigate]
  )

  // Replace single match
  const handleReplaceSingle = useCallback(
    (fileResult: FileSearchResult, match: SearchMatch) => {
      if (typeof fileResult.file.content !== "string") return

      const newContent = replaceSingleMatch(fileResult.file.content, match, replacement)
      onUpdateFile(fileResult.file.name, newContent)
    },
    [replacement, onUpdateFile]
  )

  // Replace all in file
  const handleReplaceInFile = useCallback(
    (fileResult: FileSearchResult) => {
      if (typeof fileResult.file.content !== "string") return

      const { newContent } = replaceInFile(fileResult.file.content, query, replacement, options)
      onUpdateFile(fileResult.file.name, newContent)
    },
    [query, replacement, options, onUpdateFile]
  )

  // Replace all across all files
  const handleReplaceAll = useCallback(() => {
    const results = replaceInFiles(files, query, replacement, options)
    for (const result of results) {
      onUpdateFile(result.file.name, result.newContent)
    }
  }, [files, query, replacement, options, onUpdateFile])

  // Clear search
  const handleClear = useCallback(() => {
    setQuery("")
    setReplacement("")
    searchInputRef.current?.focus()
  }, [])

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClear()
      }
    },
    [handleClear]
  )

  return (
    <div className={cn("flex h-full flex-col", className)} onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Search</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 w-6 p-0", showReplace && "bg-accent")}
            onClick={() => setShowReplace(!showReplace)}
            title="Toggle Replace"
          >
            <Replace className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="space-y-2 border-b px-3 py-2">
        <div className="flex items-center gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-7 pl-7 pr-7 text-sm"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Option toggles */}
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-7 w-7 p-0", caseSensitive && "bg-accent text-accent-foreground")}
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="Match Case"
          >
            <CaseSensitive className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-7 w-7 p-0", wholeWord && "bg-accent text-accent-foreground")}
            onClick={() => setWholeWord(!wholeWord)}
            title="Match Whole Word"
          >
            <WholeWord className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-7 w-7 p-0", useRegex && "bg-accent text-accent-foreground")}
            onClick={() => setUseRegex(!useRegex)}
            title="Use Regular Expression"
          >
            <Regex className="h-4 w-4" />
          </Button>
        </div>

        {/* Replace Input */}
        {showReplace && (
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <Replace className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="Replace"
                className="h-7 pl-7 text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleReplaceAll}
              disabled={!query || searchResults.totalMatches === 0}
              title="Replace All"
            >
              All
            </Button>
          </div>
        )}
      </div>

      {/* Results summary */}
      {query && (
        <div className="border-b px-3 py-1.5 text-xs text-muted-foreground">
          {searchResults.totalMatches === 0 ? (
            "No results found"
          ) : (
            <>
              {searchResults.totalMatches} result{searchResults.totalMatches !== 1 ? "s" : ""} in{" "}
              {searchResults.results.length} file{searchResults.results.length !== 1 ? "s" : ""}
              {searchResults.truncated && " (truncated)"}
            </>
          )}
        </div>
      )}

      {/* Results Tree */}
      <div className="flex-1 overflow-auto">
        {searchResults.results.map((fileResult) => (
          <FileResult
            key={fileResult.file.name}
            fileResult={fileResult}
            isExpanded={isFileExpanded(fileResult.file.name)}
            onToggle={() => toggleFile(fileResult.file.name)}
            onMatchClick={handleMatchClick}
            onReplaceSingle={showReplace ? handleReplaceSingle : undefined}
            onReplaceInFile={showReplace ? handleReplaceInFile : undefined}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// File Result Component
// ============================================================================

interface FileResultProps {
  fileResult: FileSearchResult
  isExpanded: boolean
  onToggle: () => void
  onMatchClick: (fileName: string, line: number) => void
  onReplaceSingle?: (fileResult: FileSearchResult, match: SearchMatch) => void
  onReplaceInFile?: (fileResult: FileSearchResult) => void
}

function FileResult({
  fileResult,
  isExpanded,
  onToggle,
  onMatchClick,
  onReplaceSingle,
  onReplaceInFile,
}: FileResultProps) {
  const fileName = fileResult.file.name
  const matchCount = fileResult.matches.length

  return (
    <div className="border-b border-border/50">
      {/* File header */}
      <div
        className="group flex cursor-pointer items-center gap-1 px-2 py-1 hover:bg-accent/50"
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <FileCode className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm">{fileName}</span>
        <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
          {matchCount}
        </span>
        {onReplaceInFile && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onReplaceInFile(fileResult)
            }}
            title="Replace All in File"
          >
            <Replace className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Matches */}
      {isExpanded && (
        <div className="pb-1">
          {fileResult.matches.map((match, index) => (
            <MatchLine
              key={`${match.line}-${match.column}-${index}`}
              match={match}
              onClick={() => onMatchClick(fileName, match.line)}
              onReplace={onReplaceSingle ? () => onReplaceSingle(fileResult, match) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Match Line Component
// ============================================================================

interface MatchLineProps {
  match: SearchMatch
  onClick: () => void
  onReplace?: () => void
}

function MatchLine({ match, onClick, onReplace }: MatchLineProps) {
  // Highlight the match in the line content
  const before = match.lineContent.substring(0, match.column)
  const matched = match.lineContent.substring(match.column, match.column + match.length)
  const after = match.lineContent.substring(match.column + match.length)

  // Trim context for display
  const maxContext = 40
  const displayBefore = before.length > maxContext ? "..." + before.slice(-maxContext) : before
  const displayAfter = after.length > maxContext ? after.slice(0, maxContext) + "..." : after

  return (
    <div
      className="group flex cursor-pointer items-center gap-2 py-0.5 pl-8 pr-2 hover:bg-accent/30"
      onClick={onClick}
    >
      <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{match.line}</span>
      <span className="flex-1 truncate font-mono text-xs">
        <span className="text-muted-foreground">{displayBefore}</span>
        <span className="rounded bg-yellow-500/30 px-0.5 font-medium text-foreground">
          {matched}
        </span>
        <span className="text-muted-foreground">{displayAfter}</span>
      </span>
      {onReplace && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onReplace()
          }}
          title="Replace"
        >
          <Replace className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
