import { useState, useEffect, useRef, type FormEvent } from "react"
import { Terminal as TerminalIcon, X, AlertCircle, ChevronUp } from "lucide-react"
import { useShell } from "@/hooks/useShell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Problem } from "@/types/problem"
import type { ScapeFile } from "@/types/file"
import type { LogEntry } from "@/types/log"
import { runScapper, createEmptyConversation } from "@/lib/ai/agent"
import type { GroqMessage } from "@/lib/ai/groqClient"

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
  isRunning?: boolean
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
  isRunning = true,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const outputBottomRef = useRef<HTMLDivElement>(null)
  const outputInputRef = useRef<HTMLInputElement>(null)
  const [programInput, setProgramInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // --- SCAPPER MODE ---
  const [isScapperMode, setIsScapperMode] = useState(false)
  const [scapperConversation, setScapperConversation] =
    useState<GroqMessage[]>(createEmptyConversation())

  // --- COMMAND HISTORY ---
  const MAX_COMMAND_HISTORY = 20
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    // Load from localStorage
    if (scapeId) {
      const stored = localStorage.getItem(`terminal-history-${scapeId}`)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          return []
        }
      }
    }
    return []
  })
  const [historyIndex, setHistoryIndex] = useState(-1) // -1 means not navigating
  const [savedInput, setSavedInput] = useState("") // Preserve current input when navigating

  // Persist command history
  useEffect(() => {
    if (scapeId && commandHistory.length > 0) {
      localStorage.setItem(`terminal-history-${scapeId}`, JSON.stringify(commandHistory))
    }
  }, [commandHistory, scapeId])

  // --- AUTOCOMPLETE ---
  const COMMANDS = [
    "echo",
    "ls",
    "cat",
    "touch",
    "rm",
    "mkdir",
    "pwd",
    "grep",
    "pip",
    "clear",
    "help",
  ]

  const getFileCompletions = (partial: string): string[] => {
    const parts = partial.trim().split(/\s+/)
    if (parts.length < 2) return [] // No file completion if no command yet

    const command = parts[0]
    if (!COMMANDS.includes(command)) return [] // Only complete after valid commands

    const currentWord = parts[parts.length - 1] || ""
    const prefix = parts.slice(0, -1).join(" ")

    // Complete file paths
    const matchingFiles = files
      .map((f) => f.name)
      .filter((name) => {
        if (!currentWord) return true // Show all files if no partial
        return name.startsWith(currentWord) || name.includes("/" + currentWord)
      })

    return matchingFiles.map((file) => prefix + " " + file)
  }

  // --- KEYBOARD HANDLERS ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+C - Cancel current input and new prompt
    if (e.key === "c" && e.ctrlKey) {
      e.preventDefault()
      if (input.trim()) {
        // Show cancelled command
        setHistory((prev) => [...prev, { type: "input", content: input + "^C", cwd: promptCwd }])
      }
      setInput("")
      setHistoryIndex(-1)
      setSavedInput("")
      return
    }

    // Tab - Autocomplete files only (after a valid command)
    if (e.key === "Tab") {
      e.preventDefault()

      // If empty input, do nothing (or could insert literal tab)
      if (!input.trim()) {
        return
      }

      const completions = getFileCompletions(input)
      if (completions.length === 0) {
        // No completions available
        return
      } else if (completions.length === 1) {
        setInput(completions[0] + " ")
      } else {
        // Find common prefix
        const sorted = completions.sort()
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        let common = ""
        for (let i = 0; i < first.length && i < last.length; i++) {
          if (first[i] === last[i]) common += first[i]
          else break
        }
        if (common.length > input.length) {
          setInput(common)
        } else {
          // Show options in terminal (just the filenames, not full paths with command)
          const fileNames = completions.map((c) => c.split(" ").pop() || "")
          setHistory((prev) => [...prev, { type: "output", content: fileNames.join("  ") }])
        }
      }
      return
    }

    // Up Arrow - Previous command
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length === 0) return

      if (historyIndex === -1) {
        // Starting navigation, save current input
        setSavedInput(input)
        setHistoryIndex(commandHistory.length - 1)
        setInput(commandHistory[commandHistory.length - 1])
      } else if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1)
        setInput(commandHistory[historyIndex - 1])
      }
      return
    }

    // Down Arrow - Next command
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex === -1) return

      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1)
        setInput(commandHistory[historyIndex + 1])
      } else {
        // Return to saved input
        setHistoryIndex(-1)
        setInput(savedInput)
      }
      return
    }
  }

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
      if (isScapperMode) {
        textareaRef.current?.focus()
      } else {
        inputRef.current?.focus()
      }
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

  // Clear program input buffer when not running (stopped) or prompt disappears
  useEffect(() => {
    if (!inputPrompt || !isRunning) {
      setProgramInput("")
    }
  }, [inputPrompt, isRunning])

  const handleCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim()
    if (!trimmed) return

    setIsProcessing(true)

    try {
      // Execute via Shell
      const result = await shell.execute(trimmed)

      // Handle different output types
      if (result.type === "scapper-enter") {
        // Enter scapper mode
        enterScapperMode()
      } else if (result.type === "clear") {
        // Clear terminal history
        setHistory([])
      } else if (result.type === "success") {
        // Silent success (e.g., redirect)
      } else if (result.type === "error") {
        setHistory((prev) => [...prev, { type: "output", content: result.content }])
      } else if (result.content) {
        // stdout, info, etc.
        setHistory((prev) => [...prev, { type: "output", content: result.content }])
      }
    } catch (e) {
      setHistory((prev) => [...prev, { type: "output", content: `Error: ${e}` }])
    } finally {
      setIsProcessing(false)
      // Re-focus input after processing
      setTimeout(() => {
        if (isScapperMode) {
          textareaRef.current?.focus()
        } else {
          inputRef.current?.focus()
        }
      }, 10)
    }
  }

  // --- SCAPPER MODE HANDLERS ---

  const enterScapperMode = () => {
    setIsScapperMode(true)
    setScapperConversation(createEmptyConversation())
    setHistory((prev) => [
      ...prev,
      {
        type: "output",
        content: (
          <div className="my-2 rounded border border-blue-500/30 bg-blue-500/10 px-3 py-2">
            <div className="font-semibold text-blue-400">🤖 Scapper - AI Coding Assistant</div>
            <div className="text-muted-foreground">Type /quit or /exit to leave</div>
          </div>
        ),
      },
    ])
  }

  const exitScapperMode = () => {
    setIsScapperMode(false)
    setScapperConversation(createEmptyConversation())
    setHistory((prev) => [...prev, { type: "output", content: "Exited Scapper." }])
  }

  const handleScapperInput = async (userInput: string) => {
    const trimmed = userInput.trim()
    if (!trimmed) return

    // Check for exit commands
    if (trimmed === "/quit" || trimmed === "/exit") {
      exitScapperMode()
      return
    }

    setIsProcessing(true)

    try {
      // Run the agent
      const { result, updatedHistory } = await runScapper(
        trimmed,
        scapperConversation,
        {
          files,
          createFile: async (name, type, content) => {
            if (onCreateFile) await onCreateFile(name, type, content)
          },
          updateFile: async (name, content) => {
            if (onUpdateFile) await onUpdateFile(name, content)
          },
          deleteFile: async (name) => {
            if (onDeleteFile) await onDeleteFile(name)
          },
        },
        (progress) => {
          // Show progress in terminal
          if (progress.type === "thinking") {
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: <span className="text-muted-foreground">⠋ {progress.message}</span>,
              },
            ])
          } else if (progress.type === "tool") {
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: <span className="text-muted-foreground">⠙ {progress.message}</span>,
              },
            ])
          } else if (progress.type === "result") {
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: <span className="text-green-400">{progress.message}</span>,
              },
            ])
          } else if (progress.type === "error") {
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: <span className="text-red-400">✗ {progress.message}</span>,
              },
            ])
          }
        }
      )

      // Update conversation
      setScapperConversation(updatedHistory)

      // Show final message
      if (result.success && result.message) {
        setHistory((prev) => [
          ...prev,
          { type: "output", content: <span className="text-foreground">{result.message}</span> },
        ])
      } else if (result.error) {
        setHistory((prev) => [
          ...prev,
          { type: "output", content: <span className="text-red-400">Error: {result.error}</span> },
        ])
      }
    } catch (e) {
      setHistory((prev) => [
        ...prev,
        { type: "output", content: <span className="text-red-400">Error: {String(e)}</span> },
      ])
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        if (isScapperMode) {
          textareaRef.current?.focus()
        } else {
          inputRef.current?.focus()
        }
      }, 10)
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
    const currentInput = input.trim()

    // Empty input - just add an empty prompt line (like real terminal)
    if (!currentInput) {
      setHistory((prev) => [
        ...prev,
        { type: "input", content: "", cwd: isScapperMode ? "scapper" : promptCwd },
      ])
      setInput("")
      return
    }

    // Add to command history (dedupe consecutive duplicates)
    if (commandHistory[commandHistory.length - 1] !== currentInput) {
      setCommandHistory((prev) => {
        const updated = [...prev, currentInput]
        // Limit to MAX_COMMAND_HISTORY
        if (updated.length > MAX_COMMAND_HISTORY) {
          return updated.slice(-MAX_COMMAND_HISTORY)
        }
        return updated
      })
    }

    // Reset history navigation
    setHistoryIndex(-1)
    setSavedInput("")

    // Add input to display history
    setHistory((prev) => [
      ...prev,
      {
        type: "input",
        content: currentInput,
        cwd: isScapperMode ? "scapper" : promptCwd,
      },
    ])

    // Route to appropriate handler
    if (isScapperMode) {
      handleScapperInput(currentInput)
    } else {
      handleCommand(currentInput)
    }
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
                <div key={i} className="mb-1" style={{ wordBreak: "break-word" }}>
                  {item.type === "input" ? (
                    <div className="flex flex-wrap">
                      <span className="shrink-0 text-green-500">➜</span>
                      <span className="shrink-0 px-1 text-blue-500">{item.cwd}</span>
                      <span className="text-foreground" style={{ wordBreak: "break-word" }}>
                        {item.content}
                      </span>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {item.content}
                    </div>
                  )}
                </div>
              ))}

              <div ref={bottomRef} />

              {!isProcessing && (
                <div className={isScapperMode ? "flex flex-col gap-1" : "flex items-center gap-2"}>
                  {isScapperMode ? (
                    <span className="text-blue-400">scapper</span>
                  ) : (
                    <>
                      <span className="text-green-500">➜</span>
                      <span className="whitespace-nowrap text-blue-500">{promptCwd}</span>
                    </>
                  )}
                  <form onSubmit={handleSubmit} className="min-w-0 flex-1">
                    {isScapperMode ? (
                      <div className="flex gap-2">
                        <span className="shrink-0 text-green-500">❯</span>
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            // Submit on Enter without Shift
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSubmit(e as unknown as React.FormEvent)
                            }
                            handleKeyDown(e as unknown as React.KeyboardEvent<HTMLInputElement>)
                          }}
                          className="m-0 w-full resize-none border-none bg-transparent p-0 text-foreground outline-none"
                          rows={1}
                          autoFocus
                          autoComplete="off"
                          spellCheck={false}
                          style={{
                            minHeight: "1.5em",
                            height: "auto",
                            overflow: "hidden",
                          }}
                          onInput={(e) => {
                            // Auto-resize textarea
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = "auto"
                            target.style.height = target.scrollHeight + "px"
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="m-0 w-full border-none bg-transparent p-0 text-foreground outline-none"
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                      />
                    )}
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
                      className={cn(
                        "w-full bg-transparent font-mono text-foreground outline-none",
                        !isRunning && "cursor-text opacity-50"
                      )}
                      autoFocus
                      disabled={!isRunning}
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
                        problem.severity === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-yellow-600 dark:text-yellow-400"
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
