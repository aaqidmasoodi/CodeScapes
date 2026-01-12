import { useState, useEffect, useRef, type FormEvent } from "react"
import {
  Terminal as TerminalIcon,
  X,
  AlertCircle,
  AlertTriangle,
  ChevronUp,
  FileText,
  FilePlus,
  FileEdit,
  Trash2,
  Play,
  Package,
  XCircle,
  CheckCircle,
} from "lucide-react"
import { ScapperIcon } from "@/components/brand/ScapperIcon"
import { PlanProposal, type ScapperPlan } from "./PlanProposal"
import { useShell } from "@/hooks/useShell"
import { useAuth } from "@/hooks/useAuth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Problem } from "@/types/problem"
import type { ScapeFile } from "@/types/file"
import type { LogEntry } from "@/types/log"
import { runScapper, createEmptyConversation } from "@/lib/ai/agent"
import type { GroqMessage } from "@/lib/ai/groqClient"
import type { EnvironmentInfo, RunResult, InstallResult, ProposedPlan } from "@/lib/ai/tools"

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
  // Terminal-mode input (when running via python3 command)
  isWaitingForTerminalInput?: boolean
  terminalInputPrompt?: string // Prompt from input() call (e.g. "What is your name? ")
  onTerminalInputSubmit?: (text: string) => void
  // Python execution state (for showing spinner)
  isPythonRunning?: boolean
  // Environment info for Scapper
  environment?: EnvironmentInfo
  dependencies?: string[]
  // Execution callbacks for Scapper
  runFile?: (path: string) => Promise<RunResult>
  installPackage?: (name: string, onProgress?: (msg: string) => void) => Promise<InstallResult>
  listPackages?: () => Promise<{ name: string; version: string }[]>
}

type HistoryItem =
  | { type: "input"; content: string; cwd: string }
  | { type: "output"; content: React.ReactNode; subtype?: "reasoning" | "result" | "tool" }

const spinnerChars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

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
  isWaitingForTerminalInput = false,
  terminalInputPrompt = "",
  onTerminalInputSubmit,
  isPythonRunning = false,
  environment,
  dependencies = [],
  runFile,
  installPackage,
  listPackages,
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
  const [terminalInput, setTerminalInput] = useState("") // For python3 input() calls
  const terminalInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Spinner animation for Scapper and Python
  const [spinnerFrame, setSpinnerFrame] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isProcessing || isPythonRunning) {
      interval = setInterval(() => {
        setSpinnerFrame((prev) => (prev + 1) % spinnerChars.length)
      }, 80)
    }
    return () => clearInterval(interval)
  }, [isProcessing, isPythonRunning])

  // --- SCAPPER MODE ---
  const [isScapperMode, setIsScapperMode] = useState(false)
  const [scapperConversation, setScapperConversation] =
    useState<GroqMessage[]>(createEmptyConversation())

  // --- PLAN APPROVAL STATE ---
  // Track which plans have been responded to (prevent button re-activation on pane switch)
  const [respondedPlanIds, setRespondedPlanIds] = useState<Set<string>>(new Set())
  // Use a ref for real-time access in closures (JSX stored in history captures current ref value)
  const respondedPlanIdsRef = useRef<Set<string>>(new Set())
  // Keep ref in sync with state
  respondedPlanIdsRef.current = respondedPlanIds
  // Ref to check if Scapper is running (for callbacks stored in history)
  const isScapperModeRef = useRef(false)
  isScapperModeRef.current = isScapperMode
  // Store the pending plan so we can feed it back to the agent on approval
  const [, setPendingPlan] = useState<{ id: string; plan: ProposedPlan } | null>(null)

  // --- ASK USER STATE ---
  // Used when Scapper needs to ask the user a question during execution
  const [scapperQuestion, setScapperQuestion] = useState<string | null>(null)
  const [scapperAnswerInput, setScapperAnswerInput] = useState("")
  const scapperAnswerResolverRef = useRef<((answer: string) => void) | null>(null)

  // --- CTRL+C CANCELLATION ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C in Scapper mode while processing
      if (e.ctrlKey && e.key === "c" && isScapperMode && isProcessing) {
        e.preventDefault()
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
          setHistory((prev) => [
            ...prev,
            {
              type: "output",
              content: (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Operation cancelled (Ctrl+C)
                </span>
              ),
            },
          ])
          setIsProcessing(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isScapperMode, isProcessing])

  // --- COMMAND HISTORY ---
  const MAX_COMMAND_HISTORY = 20
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    // Load from localStorage
    if (scapeId) {
      const stored = localStorage.getItem(`terminal - history - ${scapeId} `)
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
      localStorage.setItem(`terminal - history - ${scapeId} `, JSON.stringify(commandHistory))
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
    "python3",
    "aplay",
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

      // Abort Scapper task if running
      if (isScapperMode && isProcessing) {
        abortControllerRef.current?.abort()
        return
      }

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
    // Focus terminal input if waiting for input
    if (activeTab === "terminal" && isWaitingForTerminalInput && !isCollapsed) {
      setTimeout(() => terminalInputRef.current?.focus(), 50)
    }
  }, [history, activeTab, isCollapsed, outputLogs, inputPrompt, isWaitingForTerminalInput])

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
      const content = typeof output.content === "string" ? output.content : output.content
      if (content === "") return // Don't add empty lines

      setHistory((prev) => {
        const last = prev[prev.length - 1]
        // Merge with previous line if it's a string and doesn't end with newline
        // This handles python's unbuffered stream (print("a", "b") -> write("a"), write(" "), write("b"), write("\n"))
        if (
          last &&
          last.type === "output" &&
          typeof last.content === "string" &&
          !last.content.endsWith("\n") &&
          typeof content === "string"
        ) {
          return [...prev.slice(0, -1), { ...last, content: last.content + content }]
        }

        return [
          ...prev,
          {
            type: "output",
            // If it's an error type from shell, maybe wrap in span?
            // Existing logic just passed content.
            content,
          },
        ]
      })
    },
  })

  // Clear program input buffer when not running (stopped) or prompt disappears
  useEffect(() => {
    if (!inputPrompt || !isRunning) {
      setProgramInput("")
    }
  }, [inputPrompt, isRunning])

  const { user } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const handleCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim()
    if (!trimmed) return

    // Security check for Scapper
    if (trimmed.startsWith("scapper")) {
      if (!user) {
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: (
              <span className="text-red-400">
                Authentication Required: Please sign in to use Scapper AI.
              </span>
            ),
          },
        ])
        setShowAuthDialog(true)
        return
      }
    }

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
      setHistory((prev) => [...prev, { type: "output", content: `Error: ${e} ` }])
    } finally {
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
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <ScapperIcon size={18} /> Scapper - AI Coding Assistant
            </div>
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

    // Setup cancellation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const ac = new AbortController()
    abortControllerRef.current = ac
    setIsProcessing(true)

    try {
      // Run the agent
      const { result, updatedHistory } = await runScapper(
        trimmed,
        scapperConversation,
        {
          scapeId: scapeId || "",
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
          // Environment awareness
          environment: environment || {
            id: "web",
            name: "Web Application",
            entryPoint: "index.html",
            capabilities: { packages: false, terminal: false },
          },
          dependencies,
          // Execution tools (optional based on environment)
          runFile,
          installPackage,
          listPackages,
          // Agentic capabilities
          askUser: async (question: string): Promise<string> => {
            // Show the question in the terminal
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: (
                  <div className="my-2 rounded border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
                    <div className="font-semibold text-yellow-400">
                      ❓ Scapper needs clarification:
                    </div>
                    <div className="mt-1 text-foreground">{question}</div>
                  </div>
                ),
              },
            ])

            // Set up the question state and wait for user response
            setScapperQuestion(question)
            setScapperAnswerInput("")

            // Return a promise that resolves when user answers
            return new Promise<string>((resolve) => {
              scapperAnswerResolverRef.current = resolve
            })
          },
        },
        (progress) => {
          // Show progress in terminal
          if (progress.type === "thinking") {
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: <span className="text-muted-foreground">{progress.message}</span>,
              },
            ])
          } else if (progress.type === "tool") {
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: <span className="text-muted-foreground">{progress.message}</span>,
              },
            ])
          } else if (progress.type === "result") {
            // Skip PLAN_PROPOSAL messages - they're handled separately in final message
            if (progress.message?.includes("[PLAN_PROPOSAL]")) {
              return // Don't show raw JSON, will be rendered as PlanProposal
            }
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: (
                  <span className="flex items-center gap-1.5 text-green-400">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    {progress.message?.replace(/^✓\s*/, "")}
                  </span>
                ),
              },
            ])
          } else if (progress.type === "error") {
            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: (
                  <span className="flex items-center gap-1.5 text-red-400">
                    <XCircle className="h-3.5 w-3.5" /> {progress.message}
                  </span>
                ),
              },
            ])
          } else if (progress.type === "streaming") {
            // For streaming, update the last history item with accumulated text
            // We use the full message (which accumulates in agent.ts) and replace
            setHistory((prev) => {
              // Find if we already have a streaming output (last item before "done")
              const lastIdx = prev.length - 1
              const lastItem = prev[lastIdx]

              // Check if we should update the last item (if it looks like previous streaming output)
              // We detect this by checking if the new message starts with what was there before
              if (lastItem && lastItem.type === "output" && prev.length > 1) {
                // Replace last item with new accumulated content
                return [
                  ...prev.slice(0, -1),
                  {
                    type: "output" as const,
                    content: (
                      <span className="whitespace-pre-wrap text-foreground">
                        {progress.message}
                      </span>
                    ),
                  },
                ]
              }
              // First streaming chunk - add new item
              return [
                ...prev,
                {
                  type: "output" as const,
                  content: (
                    <span className="whitespace-pre-wrap text-foreground">{progress.message}</span>
                  ),
                },
              ]
            })
          } else if (progress.type === "reasoning") {
            setHistory((prev) => {
              const lastIdx = prev.length - 1
              const lastItem = prev[lastIdx]

              // Update ONLY if the last item is also a "reasoning" block
              // This prevents duplicate "Verifying..." lines while preserving valid history
              if (
                lastItem &&
                lastItem.type === "output" &&
                lastItem.subtype === "reasoning" &&
                prev.length > 1
              ) {
                return [
                  ...prev.slice(0, -1),
                  {
                    type: "output" as const,
                    subtype: "reasoning",
                    content: (
                      <div className="my-1 pl-3 font-mono text-muted-foreground/80">
                        <div className="flex gap-2 opacity-90">
                          <div className="whitespace-pre-wrap">{progress.message}</div>
                        </div>
                      </div>
                    ),
                  },
                ]
              }

              // Otherwise append new reasoning item
              return [
                ...prev,
                {
                  type: "output" as const,
                  subtype: "reasoning",
                  content: (
                    <div className="my-1 pl-3 font-mono text-muted-foreground/80">
                      <div className="flex gap-2 opacity-90">
                        <div className="whitespace-pre-wrap">{progress.message}</div>
                      </div>
                    </div>
                  ),
                },
              ]
            })
          }
        },
        ac.signal
      )

      // Update conversation
      setScapperConversation(updatedHistory)

      // Check for plan proposal
      if (result.message?.includes("[PLAN_PROPOSAL]")) {
        const planMatch = result.message.match(/\[PLAN_PROPOSAL\](.*?)\[\/PLAN_PROPOSAL\]/s)
        if (planMatch) {
          try {
            const plan: ProposedPlan = JSON.parse(planMatch[1])

            // Generate unique plan ID based on content hash
            const planId = `plan-${Date.now()}-${plan.summary.slice(0, 20).replace(/\s/g, "-")}`

            // Store the pending plan for approval flow
            setPendingPlan({ id: planId, plan })

            // Get icon for action type
            const getActionIcon = (action: string) => {
              switch (action) {
                case "create":
                  return <FilePlus className="h-4 w-4 text-green-400" />
                case "modify":
                  return <FileEdit className="h-4 w-4 text-yellow-400" />
                case "delete":
                  return <Trash2 className="h-4 w-4 text-red-400" />
                case "run":
                  return <Play className="h-4 w-4 text-blue-400" />
                case "install":
                  return <Package className="h-4 w-4 text-purple-400" />
                default:
                  return <FileText className="h-4 w-4 text-muted-foreground" />
              }
            }

            // Handler for plan approval/cancel
            const handlePlanResponse = (response: string, respondedPlanId: string) => {
              // Check if already responded (using ref for real-time value)
              if (respondedPlanIdsRef.current.has(respondedPlanId)) {
                return // Already processed
              }

              // Mark this plan as responded (update both state and ref)
              const newSet = new Set([...respondedPlanIdsRef.current, respondedPlanId])
              respondedPlanIdsRef.current = newSet
              setRespondedPlanIds(newSet)

              // CRITICAL: Check if Scapper is still running before processing
              if (!isScapperModeRef.current) {
                // Scapper was quit - don't restart it
                setHistory((prev) => [
                  ...prev,
                  {
                    type: "output",
                    content: (
                      <span className="text-yellow-400">
                        Scapper is not running. Type 'scapper' to start a new session.
                      </span>
                    ),
                  },
                ])
                return
              }

              // Check if approved
              if (
                response.toLowerCase().includes("yes") ||
                response.toLowerCase().includes("proceed") ||
                response.toLowerCase().includes("approve")
              ) {
                // Feed the FULL PLAN back to the agent so it knows exactly what to execute
                const approvalMessage = `[PLAN_APPROVED] Execute this plan immediately without proposing again:\n${JSON.stringify(plan, null, 2)}\n\nProceed with execution now. Do NOT call propose_plan again.`
                handleScapperInput(approvalMessage)
              } else {
                // Plan was cancelled
                handleScapperInput("Plan cancelled. Let me know how you'd like to proceed.")
              }

              // Clear pending plan
              setPendingPlan(null)
            }

            setHistory((prev) => [
              ...prev,
              {
                type: "output",
                content: (
                  <PlanProposal
                    plan={plan as ScapperPlan}
                    planId={planId}
                    checkIsResponded={() => respondedPlanIdsRef.current.has(planId)}
                    onResponse={handlePlanResponse}
                    getActionIcon={getActionIcon}
                  />
                ),
              },
            ])
            return // Don't show raw message
          } catch {
            // JSON parse failed, show raw message
          }
        }
      }

      // Show final message (normal case)
      // Skip for 'question' intent - streaming already displayed the response
      if (result.success && result.message && result.intent !== "question") {
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
    } catch (e: unknown) {
      const error = e as Error | null
      if (error?.message === "Aborted by user" || error?.name === "AbortError") {
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: (
              <span className="flex items-center gap-1.5 text-yellow-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Operation cancelled by user
              </span>
            ),
          },
        ])
      } else {
        setHistory((prev) => [
          ...prev,
          { type: "output", content: <span className="text-red-400">Error: {String(e)}</span> },
        ])
      }
    } finally {
      setIsProcessing(false)
      abortControllerRef.current = null

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
              {(() => {
                // Determine which items should be rendered as part of the history vs inline input prefix
                // We scan backwards for any "partial" lines (output strings that don't end in newline)
                let renderLimit = history.length
                const partialItems: string[] = []

                if (isWaitingForTerminalInput) {
                  for (let i = history.length - 1; i >= 0; i--) {
                    const item = history[i]
                    if (
                      item.type === "output" &&
                      typeof item.content === "string" &&
                      !/[\r\n]$/.test(item.content)
                    ) {
                      partialItems.unshift(item.content)
                      renderLimit = i
                    } else {
                      break // Stop at first full line or non-string
                    }
                  }
                }

                const itemsToRender = history.slice(0, renderLimit)
                const partialPrefix = partialItems.join("")

                return (
                  <>
                    {itemsToRender.map((item, i) => (
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
                          <span className="whitespace-pre-wrap">
                            {typeof item.content === "string"
                              ? item.content.replace(/\n$/, "")
                              : item.content}
                            {/* Show cancellation hint on the last item if active */}
                            {i === itemsToRender.length - 1 && isScapperMode && isProcessing && (
                              <span className="ml-2 text-xs opacity-70">
                                <span className="mr-1 inline-block">
                                  {spinnerChars[spinnerFrame]}
                                </span>
                                (Ctrl+C to cancel)
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Python Running Spinner */}
                    {isPythonRunning && !isWaitingForTerminalInput && (
                      <div className="mb-2 flex items-center text-muted-foreground">
                        <span className="mr-2 inline-block w-4">{spinnerChars[spinnerFrame]}</span>
                        <span>Running Python...</span>
                      </div>
                    )}

                    {/* Terminal Input (for python3 input() calls) */}
                    {isWaitingForTerminalInput && (
                      <div className="mt-1 flex items-center">
                        {/* Show the last output as inline prompt prefix */}
                        {/* Show the last output as inline prompt prefix */}
                        {partialPrefix && <span className="whitespace-pre">{partialPrefix}</span>}
                        {/* Show the input() prompt inline */}
                        {terminalInputPrompt && (
                          <span className="whitespace-pre">{terminalInputPrompt}</span>
                        )}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            if (onTerminalInputSubmit) {
                              // Combine partial prefix, prompt, and input into a single history line
                              // Add newline at end so next output appears on a new line
                              const combinedContent = `${partialPrefix}${terminalInputPrompt}${terminalInput}\n`

                              setHistory((prev) => {
                                // Keep only the full lines (remove any partials we merged visually)
                                const newHistory = prev.slice(0, renderLimit)
                                // Add the consolidated line
                                newHistory.push({
                                  type: "output",
                                  content: combinedContent,
                                })
                                return newHistory
                              })
                              onTerminalInputSubmit(terminalInput)
                              setTerminalInput("")
                            }
                          }}
                          className="flex-1"
                        >
                          <input
                            ref={terminalInputRef}
                            type="text"
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            className="m-0 w-full border-none bg-transparent p-0 text-foreground outline-none"
                            autoFocus
                            autoComplete="off"
                            spellCheck="false"
                          />
                        </form>
                      </div>
                    )}

                    {/* Scapper Ask User Input (when waiting for user answer) */}
                    {scapperQuestion && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-yellow-500">❯</span>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            if (scapperAnswerResolverRef.current) {
                              const answer = scapperAnswerInput.trim() || "(no response)"
                              // Add the answer to history
                              setHistory((prev) => [
                                ...prev,
                                {
                                  type: "output",
                                  content: <span className="text-yellow-400">↳ {answer}</span>,
                                },
                              ])
                              // Resolve the promise with the answer
                              scapperAnswerResolverRef.current(answer)
                              scapperAnswerResolverRef.current = null
                              setScapperQuestion(null)
                              setScapperAnswerInput("")
                            }
                          }}
                          className="flex-1"
                        >
                          <input
                            type="text"
                            value={scapperAnswerInput}
                            onChange={(e) => setScapperAnswerInput(e.target.value)}
                            placeholder="Type your answer..."
                            className="m-0 w-full border-none bg-transparent p-0 text-foreground outline-none placeholder:text-muted-foreground"
                            autoFocus
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </form>
                      </div>
                    )}

                    {/* Normal Command Prompt (hidden when waiting for input OR Python running OR answering Scapper) */}
                    {!isWaitingForTerminalInput && !isPythonRunning && !scapperQuestion && (
                      <div className="mt-1 flex items-start gap-2">
                        {!isScapperMode && !partialPrefix && (
                          <>
                            <span className="text-green-500">➜</span>
                            <span className="whitespace-nowrap text-blue-500">{promptCwd}</span>
                          </>
                        )}

                        {/* Render Partial Prefix Inline */}
                        {partialPrefix && (
                          <span className="whitespace-pre-wrap">{partialPrefix}</span>
                        )}

                        {/* Form continues below */}
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
                                  handleKeyDown(
                                    e as unknown as React.KeyboardEvent<HTMLInputElement>
                                  )
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
                )
              })()}

              <div ref={bottomRef} />
            </>
          )}

          {activeTab === "output" && (
            <div className="flex flex-col gap-0.5">
              {outputLogs.length === 0 && !inputPrompt ? (
                <div className="text-muted-foreground">No output available.</div>
              ) : (
                <>
                  {outputLogs.map((log, i) => {
                    const isLast = i === outputLogs.length - 1
                    // Check if we should inline the input form with this log
                    // Condition: It's the last log, we have an input prompt active,
                    // the log is standard output, and it doesn't end with a newline.
                    const showInlineInput =
                      isLast &&
                      inputPrompt !== undefined &&
                      inputPrompt !== null &&
                      log.type === "stdout" &&
                      !log.content.endsWith("\n")

                    return (
                      <div
                        key={log.id}
                        className={cn(
                          "whitespace-pre-wrap break-words",
                          log.type === "stderr"
                            ? "text-red-400"
                            : log.type === "system"
                              ? "italic text-blue-400"
                              : "text-foreground",
                          // Use flex to align text and input if inlining
                          showInlineInput && "flex flex-wrap items-center gap-0.5"
                        )}
                      >
                        {/* We use a span for content to play nice with flex if needed, though text node works too */}
                        <span>{log.content}</span>

                        {showInlineInput && (
                          <form
                            className="inline-flex min-w-[50px] flex-1 items-center"
                            onSubmit={(e) => {
                              e.preventDefault()
                              onInputSubmit?.(programInput)
                              setProgramInput("")
                            }}
                          >
                            {/* Only render extra prompt text if provided and distinct */}
                            {inputPrompt && <span className="mr-1">{inputPrompt}</span>}
                            <input
                              ref={outputInputRef}
                              type="text"
                              value={programInput}
                              onChange={(e) => setProgramInput(e.target.value)}
                              className={cn(
                                "min-w-0 flex-1 bg-transparent font-mono text-foreground outline-none",
                                !isRunning && "cursor-text opacity-50"
                              )}
                              autoFocus
                              disabled={!isRunning}
                              autoComplete="off"
                            />
                          </form>
                        )}
                      </div>
                    )
                  })}

                  {/* Standalone Input Form - Render only if NOT inlined above */}
                  {inputPrompt !== undefined &&
                    inputPrompt !== null &&
                    (outputLogs.length === 0 ||
                      outputLogs[outputLogs.length - 1].type !== "stdout" ||
                      outputLogs[outputLogs.length - 1].content.endsWith("\n")) && (
                      <div className="flex items-center">
                        <span className="whitespace-pre-wrap">{inputPrompt}</span>
                        <form
                          className="ml-1 flex-1"
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
                </>
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

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in Required</DialogTitle>
            <DialogDescription>
              Please sign in to use Scapper AI. This feature is exclusive to logged-in users.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
