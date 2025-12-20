import { useState, useEffect, useRef, type FormEvent } from "react"
import { Terminal as TerminalIcon, X, AlertCircle, ChevronUp } from "lucide-react"
import { useShell } from "@/hooks/useShell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Problem } from "@/types/problem"
import type { ScapeFile } from "@/types/file"
import type { LogEntry } from "@/types/log"

export type TerminalTab = "terminal" | "output" | "problems"

interface TerminalPaneProps {
  problems?: Problem[]
  activeTab: TerminalTab
  onTabChange: (tab: TerminalTab) => void
  onClose?: () => void
  isCollapsed?: boolean
  files?: ScapeFile[]
  scapeId?: string
  scapeName?: string
  onDeleteFile?: (path: string) => Promise<void>
  onCreateFile?: (name: string, type: ScapeFile["language"], content?: string) => Promise<void>
  onUpdateFile?: (name: string, content: string) => Promise<void>
  outputLogs?: LogEntry[]
  onExecCommand?: (
    cmd: string,
    arg: string
  ) => Promise<{ success: boolean; warning?: string; error?: string }>
  inputPrompt?: string | null
  onInputSubmit?: (text: string) => void
}

type HistoryItem =
  | { type: "input"; content: string; cwd: string }
  | { type: "output"; content: React.ReactNode }

export function TerminalPane({
  problems = [],
  activeTab,
  onTabChange,
  onClose,
  isCollapsed = false,
  files = [],
  scapeName = "project",
  scapeId,
  onDeleteFile,
  onCreateFile,
  onUpdateFile,
  outputLogs = [],
  onExecCommand,
  inputPrompt,
  onInputSubmit,
}: TerminalPaneProps) {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      type: "output",
      content: (
        <div className="mb-2">
          <div>CodeScape Terminal [Version 1.0.0]</div>
          <div>(c) 2025 CodeScape Inc.</div>
        </div>
      ),
    },
  ])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputBottomRef = useRef<HTMLDivElement>(null)
  const outputInputRef = useRef<HTMLInputElement>(null)
  const [programInput, setProgramInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Auto-scroll
  useEffect(() => {
    if (activeTab === "terminal" && !isCollapsed) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    if (activeTab === "output" && !isCollapsed) {
      outputBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    // Focus output input if prompt exists
    if (activeTab === "output" && inputPrompt && !isCollapsed) {
      // We need a ref for this new input
      setTimeout(() => outputInputRef.current?.focus(), 50)
    }
  }, [history, activeTab, isCollapsed, outputLogs, inputPrompt])

  // Focus input on click
  const handleContainerClick = () => {
    if (activeTab === "terminal" && !isCollapsed) {
      inputRef.current?.focus()
    }
  }

  // --- SHELL INTEGRATION ---
  const shell = useShell({
    files,
    createFile: async (name: string, type: ScapeFile["language"], content?: string) => {
      if (onCreateFile) await onCreateFile(name, type, content)
    },
    updateFile: async (name: string, content: string) => {
      if (onUpdateFile) await onUpdateFile(name, content)
    },
    deleteFile: async (name: string) => {
      if (onDeleteFile) await onDeleteFile(name)
    },
    onExecCommand,
    onLog: (output) => {
      // Stream output to history
      setHistory((prev) => [
        ...prev,
        {
          type: "output",
          content: output.content,
        },
      ])
    },
  })

  const handleCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim()
    if (!trimmed) return

    setIsProcessing(true)

    try {
      // Detect Legacy Commands (pip)
      const [cmd] = trimmed.split(/\s+/)
      if (cmd === "help" || cmd === "clear") {
        // ... (existing legacy checks)
        // Note: For 'clear' and 'help' which are sync, we still wrap them but they are fast.

        if (cmd === "clear") {
          setHistory([])
          setIsProcessing(false)
          return
        }

        if (cmd === "help") {
          setHistory((prev) => [
            ...prev,
            {
              type: "output",
              content: (
                <div className="text-muted-foreground">
                  Available commands:
                  <br />
                  &nbsp;&nbsp;ls, cat, touch, rm, mkdir, pwd
                  <br />
                  &nbsp;&nbsp;pip install &lt;pkg&gt;
                  <br />
                  &nbsp;&nbsp;echo "text" &gt; file.txt
                </div>
              ),
            },
          ])
          setIsProcessing(false)
          return
        }
      }

      // Execute via Shell
      const result = await shell.execute(trimmed)

      // Render Output
      if (result.type === "success") {
        // no op
      } else if (result.type === "error") {
        setHistory((prev) => [...prev, { type: "output", content: `Error: ${result.content}` }])
      } else {
        setHistory((prev) => [...prev, { type: "output", content: result.content }])
      }
    } catch (e) {
      setHistory((prev) => [...prev, { type: "output", content: `Error: ${e}` }])
    } finally {
      setIsProcessing(false)
      // Re-focus input after processing (if it became visible again)
      // setTimeout to allow React to render the input
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }

  // --- PROMPT LOGIC ---
  const promptCwd = (() => {
    const nameSlug = (scapeName || "project").trim().replace(/\s+/g, "-").toLowerCase()
    let idSuffix = ""
    if (scapeId) {
      const idStr = String(scapeId)
      // if it looks like a UUID (long string), shorten it
      if (idStr.length > 10) {
        idSuffix = `-${idStr.slice(0, 8)}`
      } else {
        idSuffix = `-${idStr}`
      }
    }
    return `~/${nameSlug}${idSuffix}`
  })()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const currentInput = input

    // Add input to history
    setHistory((prev) => [
      ...prev,
      {
        type: "input",
        content: currentInput,
        cwd: promptCwd,
      },
    ])

    handleCommand(currentInput)
    setInput("")
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-background text-foreground",
        isCollapsed ? "h-auto border-t" : "h-full"
      )}
    >
      <div
        className={cn("flex items-center justify-between px-4 py-2", !isCollapsed && "border-b")}
      >
        <div className="flex items-center gap-4 text-xs font-medium uppercase text-muted-foreground">
          <div
            className={cn(
              "-mb-2.5 flex cursor-pointer items-center gap-2 pb-2 transition-colors hover:text-foreground",
              activeTab === "terminal" &&
                !isCollapsed &&
                "border-b-2 border-primary text-foreground",
              activeTab === "terminal" && isCollapsed && "text-foreground"
            )}
            onClick={() => onTabChange("terminal")}
          >
            <TerminalIcon className="h-3.5 w-3.5" />
            Terminal
          </div>
          <div
            className={cn(
              "-mb-2.5 cursor-pointer pb-2 transition-colors hover:text-foreground",
              activeTab === "output" && !isCollapsed && "border-b-2 border-primary text-foreground",
              activeTab === "output" && isCollapsed && "text-foreground"
            )}
            onClick={() => onTabChange("output")}
          >
            Output
          </div>
          <div
            className={cn(
              "-mb-2.5 flex cursor-pointer items-center gap-1.5 pb-2 transition-colors hover:text-foreground",
              activeTab === "problems" &&
                !isCollapsed &&
                "border-b-2 border-primary text-foreground",
              activeTab === "problems" && isCollapsed && "text-foreground"
            )}
            onClick={() => onTabChange("problems")}
          >
            Problems
            {problems.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {problems.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onTabChange(activeTab)}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div
          className="flex-1 cursor-text overflow-auto p-4 font-mono text-xs"
          onClick={handleContainerClick}
        >
          {activeTab === "terminal" && (
            <>
              {history.map((item, i) => (
                <div key={i} className="mb-1 break-words">
                  {item.type === "input" ? (
                    <div className="flex gap-2">
                      <span className="text-green-500">➜</span>
                      <span className="min-w-fit text-blue-500">{item.cwd}</span>
                      <span className="text-foreground">{item.content}</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-muted-foreground">{item.content}</div>
                  )}
                </div>
              ))}

              <div ref={bottomRef} />

              {!isProcessing && (
                <div className="flex items-center gap-2">
                  <span className="text-green-500">➜</span>
                  <span className="whitespace-nowrap text-blue-500">{promptCwd}</span>
                  <form onSubmit={handleSubmit} className="min-w-0 flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="m-0 w-full border-none bg-transparent p-0 text-foreground outline-none"
                      autoFocus
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </form>
                </div>
              )}
            </>
          )}

          {activeTab === "output" && (
            <div className="flex flex-col gap-0.5">
              {outputLogs.length === 0 && !inputPrompt ? (
                <div className="text-muted-foreground">No output available.</div>
              ) : (
                outputLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "whitespace-pre-wrap break-words",
                      log.type === "stderr"
                        ? "text-red-400"
                        : log.type === "system"
                          ? "italic text-blue-400"
                          : "text-foreground"
                    )}
                  >
                    {log.content}
                  </div>
                ))
              )}
              {inputPrompt !== undefined && inputPrompt !== null && (
                <div className="flex items-center">
                  <span className="whitespace-pre-wrap">{inputPrompt}</span>
                  <form
                    className="flex-1"
                    onSubmit={(e) => {
                      e.preventDefault()
                      onInputSubmit?.(programInput)
                      setProgramInput("")
                    }}
                  >
                    <input
                      ref={outputInputRef}
                      type="text"
                      value={programInput}
                      onChange={(e) => setProgramInput(e.target.value)}
                      className="w-full bg-transparent font-mono text-foreground outline-none"
                      autoFocus
                      autoComplete="off"
                    />
                  </form>
                </div>
              )}
              <div ref={outputBottomRef} />
            </div>
          )}

          {activeTab === "problems" && (
            <div className="flex flex-col gap-1">
              {problems.length === 0 ? (
                <div className="text-muted-foreground">
                  No problems have been detected in the workspace.
                </div>
              ) : (
                problems.map((problem) => (
                  <div
                    key={problem.id}
                    className="group flex cursor-pointer items-start gap-2 rounded p-1 hover:bg-muted/50"
                  >
                    <AlertCircle
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 flex-shrink-0",
                        problem.severity === "error" ? "text-destructive" : "text-yellow-500"
                      )}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground">{problem.message}</span>
                      <span className="text-muted-foreground">
                        {problem.file} [{problem.line}:{problem.column}]
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
