import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Loader2, AlertCircle, TerminalSquare, ChevronUp, ChevronDown } from "lucide-react"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { getRunner } from "@/runners/registry"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { debug } from "@/lib/debug"

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

  // Determine if we should show the console UI
  // 1. Always show in Dev mode
  // 2. Show in Live/Published mode ONLY for Python (as requested)
  // FIX: Environment ID is "python", not "python-script"
  const isPython = scape?.environment === "python"
  const showConsoleUI = mode === "dev" || isPython

  // Determine isLive flag for Runner (hides internal headers etc)
  // True if not in explicit 'dev' mode
  const isLiveRunner = mode !== "dev"

  // Auto-open console for Python in view mode if it's the primary output
  useEffect(() => {
    if (isPython && mode !== "dev") {
      setIsConsoleOpen(true)
    }
  }, [isPython, mode])

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
    setLogs((prev) => [...prev, log])
    setIsConsoleOpen((current) => {
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
          isLive={isLiveRunner}
        />
      )}

      {/* Console Drawer (Overlay) - Only if enabled */}
      {showConsoleUI && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-50 flex flex-col border-t border-border bg-background/95 backdrop-blur transition-all duration-300 ease-in-out ${isConsoleOpen ? "h-1/3" : "h-10"
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
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-1 font-mono text-xs">
                {logs.length === 0 && (
                  <div className="italic text-muted-foreground/50">No output yet...</div>
                )}
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={log.type === "stderr" ? "text-red-500" : "text-foreground"}
                  >
                    <span className="mr-2 text-muted-foreground/50">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    {log.content}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}
