import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { Loader2, AlertCircle, TerminalSquare, ChevronUp, ChevronDown } from "lucide-react"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { getRunner } from "@/runners/registry"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { debug } from "@/lib/debug"
import { useTheme } from "@/components/theme-provider"

import type { ScapeFile } from "@/types/file"
import type { Scape } from "@/lib/db"
import type { LogEntry } from "@/types/log"

const localRepo = new LocalRepository()
const cloudRepo = new CloudRepository()

interface ScapeRunnerProps {
  mode?: "dev" | "live" | "published"
}

export default function ScapeRunnerPage({ mode = "dev" }: ScapeRunnerProps) {
  const { scapeId } = useParams() // Keep scapeId for fetching
  const [scape, setScape] = useState<Scape | null>(null)
  const [files, setFiles] = useState<ScapeFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Console State
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConsoleOpen, setIsConsoleOpen] = useState(false)
  const [unreadLogs, setUnreadLogs] = useState(0)

  // Input State
  const [isWaitingForInput, setIsWaitingForInput] = useState(false)
  const [inputMode, setInputMode] = useState<"text" | "password">("text")
  const [inputValue, setInputValue] = useState("")
  const inputResolveRef = useRef<((value: string) => void) | null>(null)
  const consoleBottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new logs
  useEffect(() => {
    if (isConsoleOpen && consoleBottomRef.current) {
      // Use scrollTop on the viewport instead of scrollIntoView to prevent page jumping
      const viewport = consoleBottomRef.current.closest(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      } else {
        // Fallback (e.g. if not using ScrollArea) - use block: nearest
        consoleBottomRef.current.scrollIntoView({ block: "nearest" })
      }
    }
  }, [logs, isConsoleOpen, isWaitingForInput])

  // Listen for theme changes from parent window (for embedded previews)
  const { setTheme } = useTheme()

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "THEME_CHANGE") {
        const theme = event.data.theme
        // Use the ThemeProvider's setTheme to properly update the theme
        setTheme(theme === "dark" ? "dark" : "light")
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [setTheme])

  // Handle Input Request from Runner
  const handleInputRequest = (_prompt: string, isPassword?: boolean): Promise<string> => {
    setIsWaitingForInput(true)
    setInputMode(isPassword ? "password" : "text")
    setIsConsoleOpen(true) // Force open console

    // Scroll to bottom when input is requested
    setTimeout(() => {
      if (consoleBottomRef.current) {
        const viewport = consoleBottomRef.current.closest(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement
        if (viewport) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
        } else {
          consoleBottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
      }
    }, 100)

    return new Promise((resolve) => {
      inputResolveRef.current = resolve
    })
  }

  // Handle Input Submission
  const submitInput = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputResolveRef.current) return

    // Add explicit log for the user input (so it stays in history)
    // The prompt is already there (from stdout usually), we just add user's typing + newline
    // MERGE logic: If the last log was the prompt (partial), append input to it.
    setLogs((prev) => {
      const echoText = inputMode === "password" ? "••••••" : inputValue
      const inputContent = echoText + "\n"
      if (prev.length > 0) {
        const last = prev[prev.length - 1]
        if (last.type === "stdout" && !last.content.endsWith("\n")) {
          return [...prev.slice(0, -1), { ...last, content: last.content + inputContent }]
        }
      }

      // Fallback: Add new log
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "stdout",
          content: inputContent,
          timestamp: Date.now(),
        },
      ]
    })

    // Resolve promise
    inputResolveRef.current(inputValue)
    inputResolveRef.current = null

    // Reset UI
    setIsWaitingForInput(false)
    setInputValue("")
  }

  // Determine if we should show the console UI
  // 1. Always show in Dev mode
  // 2. Show in Live/Published mode ONLY for Python (as requested)
  // FIX: Environment ID is "python", not "python-script"
  const isPython = scape?.environment === "python"
  const showConsoleUI = mode === "dev" || isPython

  // Determine isLive flag for Runner (hides internal headers etc)
  // True if not in explicit 'dev' mode
  const isLiveRunner = mode !== "dev"

  // Console will auto-open when output is received (see addLog callback)

  useEffect(() => {
    async function fetchScape() {
      // Use the prop mode if available, otherwise fallback to urlMode, then default to "dev"
      // Note: urlMode from useParams might be synonymous with route path, but we pass mode prop from App.tsx usually.
      const currentMode = mode

      if (!scapeId) return
      setLoading(true)
      setError(null)
      try {
        debug.log(`[Runner] Booting Scape: ${scapeId} In Mode: ${currentMode}`)

        // 1. Published Mode (Community/Public View)
        if (currentMode === "published") {
          const published = await cloudRepo.getPublishedScape(scapeId)
          if (published) {
            setScape(published.scape)
            setFiles(published.files)
            setLoading(false)
            return
          } else {
            throw new Error("No published version found for this Scape.")
          }
        }

        // 2. Live Mode (Developer Preview - Draft)
        if (currentMode === "live") {
          // Fetch remote draft explicitly
          const cloudScape = await cloudRepo.getScape(scapeId)
          if (cloudScape) {
            setScape(cloudScape)
            setFiles(await cloudRepo.getFiles(scapeId))
            setLoading(false)
            return
          }
        }

        // 3. Dev Mode (Local -> Cloud Draft Fallback)
        // Try Local First - but only use if it's actually a local scape
        const localScape = await localRepo.getScape(scapeId)
        if (localScape && localScape.source === "local") {
          setScape(localScape)
          setFiles(await localRepo.getFiles(scapeId))
          setLoading(false)
          return
        }

        // Fallback to Cloud Draft
        const cloudScape = await cloudRepo.getScape(scapeId)
        if (cloudScape) {
          setScape(cloudScape)
          setFiles(await cloudRepo.getFiles(scapeId))
          setLoading(false)
          return
        }

        setError("Scape not found")
      } catch (err: unknown) {
        console.error(err)
        const message = err instanceof Error ? err.message : "Failed to load Scape"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    fetchScape()
  }, [scapeId, mode])

  // Determine Runner
  const RunnerComponent = scape ? getRunner(scape.environment) : null

  // Logic moved to top for Hook Rules compliance

  if (!scape && loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !scape) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-destructive">
        <AlertCircle className="mb-4 h-12 w-12" />
        <h2 className="text-xl font-bold">Error</h2>
        <p className="mt-2 text-muted-foreground">{error || "Scape not found"}</p>
      </div>
    )
  }

  // Stable callback to prevent unnecessary Runner re-renders
  const addLog = (log: LogEntry) => {
    setLogs((prev) => {
      if (prev.length === 0) return [log]

      const last = prev[prev.length - 1]
      // Merge if same type and last one didn't end with newline
      if (
        last.type === log.type &&
        // Ensure strictly standard output types merge.
        // We might want to keep stderr separate, or merge if suitable.
        // For now, enable merging for stdout/stderr if types match.
        !last.content.endsWith("\n")
      ) {
        // Return new array with replaced last item
        return [...prev.slice(0, -1), { ...last, content: last.content + log.content }]
      }

      return [...prev, log]
    })
    setIsConsoleOpen((current) => {
      // Auto-open console on first output in live/published modes
      if (!current && mode !== "dev") {
        return true
      }
      if (!current) setUnreadLogs((prev) => prev + 1)
      return current
    })
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {RunnerComponent && (
        <RunnerComponent
          files={files}
          scapeId={scape.id}
          dependencies={scape.dependencies}
          onOutput={addLog}
          onInputRequest={handleInputRequest}
          isLive={isLiveRunner}
        />
      )}

      {/* Console Drawer (Overlay) - Only if enabled */}
      {showConsoleUI && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-50 flex flex-col border-t border-border bg-background/95 backdrop-blur transition-all duration-300 ease-in-out ${
            isConsoleOpen ? "h-1/3" : "h-10"
          }`}
        >
          {/* Drawer Handle / Header */}
          <div
            className="flex h-10 cursor-pointer items-center justify-between border-b border-border/50 px-4 hover:bg-accent/50"
            onClick={() => {
              setIsConsoleOpen(!isConsoleOpen)
              if (!isConsoleOpen) setUnreadLogs(0)
            }}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <TerminalSquare className="h-4 w-4" />
              <span>Console Output</span>
              {unreadLogs > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {unreadLogs}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isConsoleOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Console Content */}
          {isConsoleOpen && (
            <ScrollArea className="flex-1 p-4 font-mono text-xs">
              <div className="flex flex-col gap-0.5">
                {logs.length === 0 && (
                  <div className="italic text-muted-foreground/50">No output yet...</div>
                )}

                {/* Render Logic with Partial Support */}
                {(() => {
                  const renderItems = []
                  // We need to handle the case where the LAST log item is a partial line (prompt)
                  // If waiting for input, the prompt might be the very last item without a newline.

                  let limit = logs.length
                  let inlinePrompt = null

                  if (isWaitingForInput && logs.length > 0) {
                    const lastLog = logs[logs.length - 1]
                    // If last log is a string and does NOT end with newline, treat as inline prompt
                    if (lastLog.type !== "stderr" && !lastLog.content.endsWith("\n")) {
                      inlinePrompt = lastLog.content
                      limit = logs.length - 1 // Don't render it in the main loop
                    }
                  }

                  for (let i = 0; i < limit; i++) {
                    const log = logs[i]

                    // Strip trailing newline visually to prevent double spacing
                    // But keep it for logic if we were doing complex parsing
                    const displayContent = log.content.endsWith("\n")
                      ? log.content.slice(0, -1)
                      : log.content

                    renderItems.push(
                      <div
                        key={log.id}
                        className={log.type === "stderr" ? "text-red-500" : "text-foreground"}
                        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >
                        <span className="mr-2 select-none text-[10px] opacity-30">
                          [
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                          ]
                        </span>
                        {displayContent}
                      </div>
                    )
                  }

                  // Push the Inline Input Row if waiting
                  if (isWaitingForInput) {
                    renderItems.push(
                      <form
                        key="input-form"
                        onSubmit={submitInput}
                        className="mt-0.5 flex items-start"
                      >
                        {/* Timestamp for the input line too */}
                        <span className="mr-2 select-none pt-1 text-[10px] opacity-30">
                          [
                          {new Date().toLocaleTimeString([], {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                          ]
                        </span>

                        <div className="flex flex-1 flex-wrap items-center">
                          {/* The Prompt */}
                          {inlinePrompt && (
                            <span className="mr-1 whitespace-pre-wrap text-foreground">
                              {inlinePrompt}
                            </span>
                          )}

                          {/* The Input */}
                          <input
                            autoFocus
                            type={inputMode}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="m-0 min-w-[10px] flex-1 border-none bg-transparent p-0 font-mono text-foreground outline-none"
                            autoComplete="off"
                            spellCheck="false"
                          />
                        </div>
                      </form>
                    )
                  }

                  return renderItems
                })()}

                <div ref={consoleBottomRef} />
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}
