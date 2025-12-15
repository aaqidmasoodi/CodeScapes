import { useState, useEffect, useRef, type FormEvent } from "react"
import { Terminal as TerminalIcon, X, AlertCircle, ChevronUp } from "lucide-react"
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
  scapeName?: string
  onDeleteFile?: (path: string) => void
  outputLogs?: LogEntry[]
  onExecCommand?: (
    cmd: string,
    arg: string
  ) => Promise<{ success: boolean; warning?: string; error?: string }>
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
  onDeleteFile,
  outputLogs = [],
  onExecCommand,
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
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    command: "rm"
    file: string
  } | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputBottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    if (activeTab === "terminal" && !isCollapsed) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    if (activeTab === "output" && !isCollapsed) {
      outputBottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [history, activeTab, isCollapsed, outputLogs])

  // Focus input on click
  const handleContainerClick = () => {
    if (activeTab === "terminal" && !isCollapsed) {
      inputRef.current?.focus()
    }
  }

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim()
    if (!trimmed) return

    const [cmd, ...args] = trimmed.split(/\s+/)

    // Check if waiting for confirmation
    if (pendingConfirmation) {
      if (pendingConfirmation.command === "rm") {
        if (cmd.toLowerCase() === "y" || cmd.toLowerCase() === "yes") {
          if (onDeleteFile) {
            onDeleteFile(pendingConfirmation.file)
            setHistory((prev) => [
              ...prev,
              { type: "output", content: `Deleted '${pendingConfirmation.file}'` },
            ])
          } else {
            setHistory((prev) => [
              ...prev,
              { type: "output", content: `Error: Delete handler not connected.` },
            ])
          }
        } else {
          setHistory((prev) => [...prev, { type: "output", content: "Aborted." }])
        }
      }
      setPendingConfirmation(null)
      return
    }

    // Normal Commands
    switch (cmd) {
      case "help":
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: (
              <div className="text-muted-foreground">
                Available commands:
                <br />
                &nbsp;&nbsp;help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show this help message
                <br />
                &nbsp;&nbsp;ls&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List files
                <br />
                &nbsp;&nbsp;rm &lt;file&gt;&nbsp;Delete a file
                <br />
                &nbsp;&nbsp;clear&nbsp;&nbsp;&nbsp;&nbsp;Clear terminal
              </div>
            ),
          },
        ])
        break
      case "clear":
        setHistory([])
        break
      case "ls": {
        const fileList = files
          .map((f) => f.name)
          .sort()
          .join("\n")
        setHistory((prev) => [
          ...prev,
          { type: "output", content: <div className="text-blue-400">{fileList || "(empty)"}</div> },
        ])
        break
      }
      case "pip": {
        const subCmd = args[0]
        const pkg = args[1]

        if (subCmd === "install" && pkg) {
          setHistory((prev) => [...prev, { type: "output", content: `Collecting ${pkg}...` }])
          if (onExecCommand) {
            onExecCommand("pip-install", pkg).then((result) => {
              const { success, error } = result
              setHistory((prev) => [
                ...prev,
                {
                  type: "output",
                  content: success
                    ? `Successfully installed ${pkg}`
                    : `Failed to install ${pkg}${error ? `: ${error}` : ""}`,
                },
              ])
            })
          } else {
            setHistory((prev) => [
              ...prev,
              { type: "output", content: "Error: Package manager not connected." },
            ])
          }
        } else if (subCmd === "uninstall" && pkg) {
          setHistory((prev) => [...prev, { type: "output", content: `Uninstalling ${pkg}...` }])
          if (onExecCommand) {
            onExecCommand("pip-uninstall", pkg).then((result) => {
              const { success, error } = result
              setHistory((prev) => [
                ...prev,
                {
                  type: "output",
                  content: success
                    ? `Successfully uninstalled ${pkg}`
                    : `Failed to uninstall ${pkg}${error ? `: ${error}` : ""}`,
                },
              ])
            })
          } else {
            setHistory((prev) => [
              ...prev,
              { type: "output", content: "Error: Package manager not connected." },
            ])
          }
        } else {
          setHistory((prev) => [
            ...prev,
            { type: "output", content: "Usage: pip install <package> | pip uninstall <package>" },
          ])
        }
        break
      }
      case "rm":
        if (!args[0]) {
          setHistory((prev) => [...prev, { type: "output", content: "Usage: rm <filename>" }])
        } else {
          const target = args[0]
          const exists = files.some((f) => f.name === target)
          if (!exists) {
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: `rm: cannot remove '${target}': No such file or directory`,
              },
            ])
          } else {
            setHistory((prev) => [
              ...prev,
              { type: "output", content: `remove '${target}'? [y/N]` },
            ])
            setPendingConfirmation({ command: "rm", file: target })
          }
        }
        break
      default:
        setHistory((prev) => [
          ...prev,
          { type: "output", content: `zsh: command not found: ${cmd}` },
        ])
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const currentInput = input

    // Add input to history
    setHistory((prev) => [
      ...prev,
      {
        type: "input",
        content: currentInput,
        cwd: `~/${scapeName.replace(/\s+/g, "-").toLowerCase()}`,
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

              <div className="flex items-center gap-2">
                {pendingConfirmation ? (
                  <span className="font-bold text-yellow-500">?</span>
                ) : (
                  <>
                    <span className="text-green-500">➜</span>
                    <span className="whitespace-nowrap text-blue-500">
                      ~/{scapeName?.replace(/\s+/g, "-").toLowerCase() || "project"}
                    </span>
                  </>
                )}
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
              <div ref={bottomRef} />
            </>
          )}

          {activeTab === "output" && (
            <div className="flex flex-col gap-0.5">
              {outputLogs.length === 0 ? (
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
