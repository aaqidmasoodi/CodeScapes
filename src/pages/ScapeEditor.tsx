import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useParams, Navigate } from "react-router-dom"
import * as ResizablePrimitive from "react-resizable-panels"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScapeLayout } from "@/layouts/ScapeLayout"
import { CodeEditor } from "@/components/editor/CodeEditor"
import { FileExplorer } from "@/components/editor/FileExplorer"
import { PreviewPane, type PreviewPaneHandle } from "@/components/editor/PreviewPane"
import { PackagePane } from "@/components/editor/PackagePane"
import { TerminalPane, type TerminalTab } from "@/components/editor/TerminalPane"

import { EditorActivityBar } from "@/components/layout/EditorActivityBar"
import { SaveStatus } from "@/components/editor/SaveStatus"
import { ShareDialog } from "@/components/editor/ShareDialog"
import type { ScapeFile } from "@/types/file"
import type { Problem } from "@/types/problem"
import type { LogEntry } from "@/types/log"
import { useFileSystem } from "@/hooks/useFileSystem"
import { useAuth } from "@/hooks/useAuth"
import { useScapeLoading } from "@/hooks/useScapeLoading"
import { useDebounce } from "@/hooks/useDebounce"
import { buildFileTree, type FileNode } from "@/lib/file-tree"
import { getLanguageFromFilename } from "@/lib/language-utils"
import {
  Zap,
  LogOut,
  PanelRightOpen,
  Play,
  Square,
  RotateCw,
  Loader2,
  MonitorPlay,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ENVIRONMENTS } from "@/config/environments"
import { SettingsModal } from "@/components/editor/SettingsModal"
import { checkShortcut } from "@/config/shortcuts"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LoadingOverlay } from "@/components/ui/spinner"

// --- Helper for Persistence ---
function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch (e) {
      console.warn("Failed to load persistent state:", key, e)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      console.warn("Failed to save persistent state:", key, e)
    }
  }, [key, state])

  return [state, setState]
}

// Helper for Layout Validation
const getLayout = (key: string, defaults: number[]) => {
  try {
    const stored = localStorage.getItem(key)
    const parsed = stored ? JSON.parse(stored) : null

    // Validate that we have an array of the correct length and all numbers
    if (
      Array.isArray(parsed) &&
      parsed.length === defaults.length &&
      parsed.every((n: unknown) => typeof n === "number")
    ) {
      return parsed
    }
    return defaults
  } catch {
    return defaults
  }
}

export default function ScapeEditor() {
  const { scapeId } = useParams()
  // STRICT UUID LOGIC (Clean Slate)
  const id = scapeId || ""
  const { user } = useAuth()

  // Load Scape and Files
  const { scape, source, emitUpdate, isLoading } = useScapeLoading(id)

  const {
    files,
    isInitialized,
    createFile,
    updateFile,
    deleteFile,
    bulkRename,
    updateScape,
    saveState,
    lastSaved,
  } = useFileSystem(id, source)

  // Local State
  // Preview Collapsed State (Lifted to top for safety)
  // Run Lifecycle State
  const [isRunning, setIsRunning] = useState(true)
  const [isRunnerBusy, setIsRunnerBusy] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = usePersistentState("scape-preview-open", true)

  // Optimistic UI for Dependencies
  const [optimisticDependencies, setOptimisticDependencies] = useState<string[] | null>(null)

  const [debouncedFiles, setDebouncedFiles] = useState<ScapeFile[]>([])
  const [initialPreviewSynced, setInitialPreviewSynced] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [outputLogs, setOutputLogs] = useState<LogEntry[]>([])
  const [inputPrompt, setInputPrompt] = useState<string | null>(null)
  const [syntaxProblems, setSyntaxProblems] = useState<Problem[]>([])
  const [runtimeProblems, setRuntimeProblems] = useState<Problem[]>([])

  // --- PERSISTENT STATE ---

  // Activity Bar State
  const [activeTool, setActiveTool] = usePersistentState<"explorer" | "search" | "packages" | null>(
    "codescape:ui:activeTool",
    "explorer"
  )
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 1. Validate Sidebar Constraint (10% - 30%)
  const SIDEBAR_MIN = 10
  const SIDEBAR_MAX = 30

  // Safe Layout Loader
  const getSafeLayout = () => {
    const layout = getLayout("codescape:layout:main", [15, 85])
    const sidebarSize = layout[0]

    // Auto-correct corruption
    if (sidebarSize < SIDEBAR_MIN || sidebarSize > SIDEBAR_MAX) {
      return [15, 85]
    }
    return layout
  }

  const previewRef = useRef<PreviewPaneHandle>(null)
  const mainLayoutGroupRef = useRef<ResizablePrimitive.ImperativePanelGroupHandle>(null)
  const previewPanelRef = useRef<ResizablePrimitive.ImperativePanelHandle>(null)

  // Sync Preview Collapse State
  useEffect(() => {
    const checkPanel = () => {
      const panel = previewPanelRef.current
      if (panel) {
        if (isPreviewOpen) {
          panel.expand()
        } else {
          panel.collapse()
        }
      }
    }
    // Small timeout to ensure refs are ready and initial layout is done
    const t = setTimeout(checkPanel, 50)
    return () => clearTimeout(t)
  }, [isPreviewOpen])

  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = usePersistentState(
    "codescape:ui:isTerminalOpen",
    true
  )
  const [terminalTab, setTerminalTab] = usePersistentState<TerminalTab>(
    "codescape:ui:terminalTab",
    "terminal"
  )

  // Project Specific State
  const [activeFilePath, setActiveFilePath] = usePersistentState<string | null>(
    `codescape:project:${id}:activeFile`,
    null
  )
  const [expandedFoldersList, setExpandedFoldersList] = usePersistentState<string[]>(
    `codescape:project:${id}:expandedFolders`,
    []
  )

  // Derived States
  const expandedFolders = useMemo(() => new Set(expandedFoldersList), [expandedFoldersList])

  const activeFile = useMemo(
    () => files.find((f) => f.name === activeFilePath) || null,
    [files, activeFilePath]
  )

  // --- INITIALIZATION ---
  // File sync is handled by useFileSystem hook

  // 2. Validate Active File
  useEffect(() => {
    if (files.length > 0 && scape) {
      const storedExists = files.some((f) => f.name === activeFilePath)

      // If no active file, or the current one was deleted/doesn't exist
      if (!activeFilePath || !storedExists) {
        // Resolve Entry Point based on Environment
        const envConfig = ENVIRONMENTS[scape.environment]
        const entryPoint = envConfig ? envConfig.entryPoint : "index.html"

        const defaultFile =
          files.find((f) => f.name === entryPoint) || files.find((f) => f.language !== "folder")

        if (defaultFile) {
          setActiveFilePath(defaultFile.name)
        } else if (activeFilePath) {
          // If NO valid files exist (unlikely), clear active
          setActiveFilePath(null)
        }
      }
    }
  }, [files, activeFilePath, setActiveFilePath, scape])

  // Auto-Refresh State
  const [autoRefresh, setAutoRefresh] = usePersistentState("codescape:ui:autoRefresh", true)

  // Use debounce hook to prevent instant updates
  const deferredFiles = useDebounce(files, 750)

  // Track last capture time to prevent spam
  const lastCaptureRef = useRef<number>(0)
  const isInitialMount = useRef(true)

  // Initial Preview Sync: Always show content on load, regardless of Auto-Refresh setting
  useEffect(() => {
    if (!initialPreviewSynced && files.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDebouncedFiles(files)
      setInitialPreviewSynced(true)
    }
  }, [files, initialPreviewSynced])

  // Auto-Refresh Preview State
  useEffect(() => {
    if (autoRefresh) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDebouncedFiles(deferredFiles)
    }
  }, [deferredFiles, autoRefresh])

  // 2. Capture Logic (Triggered by Preview Updates)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // If debouncedFiles changed, it means the preview updated (Auto or Manual).
    // We should try to capture.
    const capture = async () => {
      // Don't capture if preview is collapsed (would be blank)
      if (!isPreviewOpen) return

      if (!previewRef.current || !id) return

      // Cooldown check?
      // For Manual Run, we want immediate capture.
      // For Auto, we want throttled.
      // How to distinguish?
      // Maybe we just always capture on preview update?
      // Use a shorter cooldown (e.g. 5s) just to prevent rapid spam?
      const now = Date.now()
      // If it was manual (autoRefresh=false), we force capture.
      // If auto, we use 60s rule?
      // Let's use 10s rule generally to be safe.
      if (now - lastCaptureRef.current > 10000 || !autoRefresh) {
        try {
          // Wait for iframe to load?
          // The srcDoc update is fast but script execution takes time.
          // Let's wait 500ms?
          await new Promise((r) => setTimeout(r, 1000))
          const thumb = await previewRef.current.captureThumbnail()
          if (thumb) {
            await updateScape({ thumbnail: thumb })
            lastCaptureRef.current = Date.now()
            console.log("Thumbnail Captured")
          }
        } catch (e) {
          console.warn(e)
        }
      }
    }

    capture()
  }, [debouncedFiles, id, autoRefresh, isPreviewOpen, updateScape])

  const handleManualRefresh = useCallback(() => {
    setOutputLogs([]) // Clear output
    setInputPrompt(null) // Clear any pending input prompt
    setIsRefreshing(true)
    setDebouncedFiles([...files]) // Force new reference to ensure update
    setTimeout(() => setIsRefreshing(false), 500)

    // Ensure Output is visible (only switch tab if open)
    setTerminalTab("output")
  }, [files, setTerminalTab])

  const handleRun = useCallback(() => {
    if (!isRunning) setIsRunning(true)
    handleManualRefresh()
  }, [isRunning, handleManualRefresh])

  const handleSave = useCallback(() => {
    // Logic handled in CodeEditor via Monaco Command mostly,
    // but if we wanted a global save (e.g. from non-editor focus),
    // we would need to trigger a "save all" or similar.
    // For now, we just rely on auto-save behavior of the state,
    // but we can add visual feedback.
    console.log("Global Save Triggered")
  }, [])

  const handleExecCommand = useCallback(
    async (
      cmd: string,
      arg: string,
      onProgress?: (message: string) => void
    ): Promise<{ success: boolean; warning?: string; error?: string }> => {
      if (cmd === "pip-install") {
        // 1. Install in Runtime (expects the full payload with flags)
        const result = (await previewRef.current?.installPackage?.(arg, onProgress)) ?? {
          success: false,
          error: "Preview not ready",
        }

        if (result.success) {
          // 2. Parse payload to get clean package names for persistence
          let newPackages: string[] = []
          try {
            if (arg.trim().startsWith("{")) {
              const parsed = JSON.parse(arg)
              newPackages = parsed.packages || []
            } else {
              newPackages = [arg]
            }
          } catch {
            newPackages = [arg]
          }

          // 3. Persist to DB
          const currentDeps = scape?.dependencies || []
          // Filter out existing ones
          const toAdd = newPackages.filter((p) => !currentDeps.includes(p))

          if (toAdd.length > 0) {
            const nextDeps = [...currentDeps, ...toAdd]
            // Optimistic Update
            setOptimisticDependencies(nextDeps)
            await updateScape({ dependencies: nextDeps })
            // Broadcast to other clients
            if (emitUpdate) emitUpdate({ dependencies: nextDeps })
          }
        }
        return result
      }

      if (cmd === "pip-uninstall") {
        // We force a restart of the worker to reload with the new dependency list.
        const currentDeps = scape?.dependencies || []
        const newDeps = currentDeps.filter((d) => d !== arg)

        // Optimistic Update
        setOptimisticDependencies(newDeps)

        await updateScape({ dependencies: newDeps })
        // Broadcast to other clients
        if (emitUpdate) emitUpdate({ dependencies: newDeps })

        // Wait a tick for prop propagation (though ref-based restart pulls from parent props on re-render?)
        // Actually, we should trigger restart. The restart logic in PythonRunner uses a ref for dependencies.
        // If we update DB -> ScapeEditor re-renders -> passes new deps to PreviewPane -> PythonRunner updates its ref.
        // Then we call restart.
        // Ideally we await the DB update. The re-render might happen async.
        // Safe bet: The restart will re-initialize. If the prop hasn't updated yet, it might re-install the old dep.
        // But ScapeEditor re-render should be fast.
        // Let's rely on React reactivity.

        setTimeout(async () => {
          if (previewRef.current?.restart) {
            await previewRef.current.restart()
          }
        }, 100) // Slight delay to ensure props update

        return { success: true }
      }

      return { success: false, error: "Unknown command handling" }
    },
    [scape?.dependencies, emitUpdate, optimisticDependencies, updateScape]
  )

  const handleDeletePackage = useCallback(
    async (pkg: string) => {
      await handleExecCommand("pip-uninstall", pkg)
    },
    [handleExecCommand]
  )

  const handleInputRequest = useCallback(
    (prompt: string) => {
      setInputPrompt(prompt)
      setTerminalTab("output")
      setIsTerminalOpen(true)
    },
    [setTerminalTab, setIsTerminalOpen]
  )

  const handleInputSubmit = useCallback(
    async (text: string) => {
      // 1. Echo to output (Prompt + Input + Newline)
      setOutputLogs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "stdout",
          // Echo the prompt sequence as if it was printed, then the input
          content: (inputPrompt || "") + text + "\n",
          timestamp: Date.now(),
        },
      ])

      // 2. Clear Prompt
      setInputPrompt(null)

      // 3. Send to Runner
      if (previewRef.current && "provideInput" in previewRef.current) {
        // @ts-expect-error - Custom method on handle
        await previewRef.current.provideInput(text)
      }
    },
    [inputPrompt, setOutputLogs, setInputPrompt, previewRef]
  )

  // 4. FileSystem Sync (from Runner)
  const handleFileSystemUpdate = useCallback(
    async (updatedFiles: ScapeFile[]) => {
      // Sync logic: Worker -> Editor
      for (const newFile of updatedFiles) {
        const existing = files.find((f) => f.name === newFile.name)

        // Check for Base64 encoding
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let content: string | Uint8Array = newFile.content as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((newFile as any).encoding === "base64") {
          // Decode Base64 to Uint8Array
          const binaryString = atob(newFile.content as string)
          const len = binaryString.length
          const bytes = new Uint8Array(len)
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          content = bytes
        }

        if (!existing) {
          // New File Created by Script
          const lang = getLanguageFromFilename(newFile.name)
          await createFile(newFile.name, lang as ScapeFile["language"], content)
        } else {
          // Existing File
          // Compare content? Difficult with Uint8Array vs String vs DB types.
          // For now, assume update if it came from worker.
          // We can do a quick length check or just overwrite.
          // Overwriting is safer for correctness.

          if (typeof existing.content !== typeof content || existing.content !== content) {
            // Deep equality for Uint8Array?
            if (content instanceof Uint8Array && existing.content instanceof Uint8Array) {
              // Compare bytes
              let changed = false
              if (content.length !== existing.content.length) changed = true
              else {
                for (let i = 0; i < content.length; i++) {
                  if (content[i] !== existing.content[i]) {
                    changed = true
                    break
                  }
                }
              }
              if (changed) updateFile(newFile.name, content)
            } else {
              updateFile(newFile.name, content)
            }
          }
        }
      }
    },
    [files, createFile, updateFile]
  )

  // --- GLOBAL SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // sidebar
      if (checkShortcut(e, "toggleSidebar")) {
        e.preventDefault()
        setActiveTool((current) => (current === "explorer" ? null : "explorer"))
        return
      }

      // terminal
      if (checkShortcut(e, "toggleTerminal")) {
        e.preventDefault()
        setIsTerminalOpen((current) => !current)
        return
      }

      // run
      if (checkShortcut(e, "run") || ((e.metaKey || e.ctrlKey) && e.key === "r")) {
        e.preventDefault()
        handleRun()
        return
      }

      // save - intercept to prevent browser save even if not in editor
      if (checkShortcut(e, "save")) {
        e.preventDefault()
        handleSave()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setActiveTool, setIsTerminalOpen, handleRun, handleSave])

  // --- HANDLERS ---

  const handleFileSelect = (file: ScapeFile) => {
    setActiveFilePath(file.name)
  }

  const handleCodeChange = useCallback(
    (newContent: string | undefined) => {
      // Use activeFilePath directly to avoid dependency on the changing activeFile object
      if (!activeFilePath || newContent === undefined) return
      updateFile(activeFilePath, newContent)
      setRuntimeProblems([])
    },
    [activeFilePath, updateFile]
  )

  const handleCreateFile = async (
    fileName: string,
    type?: string,
    content?: string | Blob | ArrayBuffer | Uint8Array
  ) => {
    if (!fileName) return
    if (files.some((f) => f.name === fileName)) {
      alert("File already exists")
      return
    }

    let language: ScapeFile["language"] = "javascript"
    if (type) {
      language = type as ScapeFile["language"]
    } else {
      // Use our new robust utility
      language = getLanguageFromFilename(fileName) as ScapeFile["language"]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await createFile(fileName, language as any, content as any)
    // Auto-select new file
    setActiveFilePath(fileName)
  }

  const handleCreateFolder = async (folderName: string) => {
    if (!folderName) return
    if (files.some((f) => f.name === folderName)) return
    await createFile(folderName, "folder")
    // Auto-expand
    handleToggleFolder(folderName)
  }

  const handleDelete = (path: string) => setItemToDelete(path)

  const confirmDelete = async () => {
    if (!itemToDelete) return
    await deleteFileDirectly(itemToDelete)
    setItemToDelete(null)
  }

  const deleteFileDirectly = async (path: string) => {
    await deleteFile(path)

    if (activeFilePath && (activeFilePath === path || activeFilePath.startsWith(path + "/"))) {
      setActiveFilePath(null)
    }
  }

  const handleMoveNode = async (oldPath: string, newPath: string) => {
    if (files.some((f) => f.name === newPath)) return

    const updates: { id: string; name: string }[] = []

    // Rename the node itself (file or folder)
    const exactNode = files.find((f) => f.name === oldPath)
    if (exactNode && exactNode.id) {
      updates.push({ id: exactNode.id, name: newPath })
    }

    // Rename children (if it was a folder)
    const filesToMove = files.filter((f) => f.name.startsWith(oldPath + "/"))
    filesToMove.forEach((f) => {
      if (f.id) {
        updates.push({ id: f.id, name: newPath + f.name.slice(oldPath.length) })
      }
    })

    if (updates.length > 0) {
      await bulkRename(updates)
    }

    if (
      activeFilePath &&
      (activeFilePath === oldPath || activeFilePath.startsWith(oldPath + "/"))
    ) {
      setActiveFilePath(newPath + activeFilePath.slice(oldPath.length))
    }
  }

  const handleToggleFolder = (path: string) => {
    const next = new Set(expandedFolders)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    setExpandedFoldersList(Array.from(next))
  }

  const handleTerminalTabChange = (tab: TerminalTab) => {
    setTerminalTab(tab)
    if (!isTerminalOpen) setIsTerminalOpen(true)
  }

  const handleOutput = useCallback((log: LogEntry) => {
    setOutputLogs((prev) => [...prev, log])
    // Switch to output tab? Maybe.
    // setActiveTab("output")
  }, [])

  // --- PROBLEMS & VALIDATION ---

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "RUNTIME_ERROR") {
        const error = event.data.payload
        if (!error || typeof error !== "object") return
        setRuntimeProblems((prev) => {
          if (prev.some((p) => p.message === error.message && p.line === error.line)) return prev
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              file: "index.html",
              message: error.message || "Unknown Runtime Error",
              line: error.line || 0,
              column: error.column || 0,
              severity: "error",
              source: "runtime",
            },
          ]
        })
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const problems = useMemo(
    () => [...syntaxProblems, ...runtimeProblems],
    [syntaxProblems, runtimeProblems]
  )
  const handleValidate = useCallback(
    (fileProblems: Problem[]) => setSyntaxProblems(fileProblems),
    [setSyntaxProblems]
  )

  const fileTree = useMemo(() => {
    const tree = buildFileTree(files)
    const applyExpansion = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => ({
        ...node,
        isOpen: expandedFolders.has(node.path),
        children: node.children ? applyExpansion(node.children) : undefined,
      }))
    return applyExpansion(tree)
  }, [files, expandedFolders])

  // -- LOADING / ERROR STATES --
  if (!id)
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Invalid API ID
      </div>
    )

  // 1. Loading Metadata (User info, environment type, etc.)
  if (isLoading)
    return (
      <div className="h-screen w-screen">
        <LoadingOverlay message="Loading Scape Metadata..." />
      </div>
    )

  // 2. Metadata Loaded but not found (or private)
  if (!scape)
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Scape not found or access denied.
      </div>
    )

  // 3. ACCESS CONTROL (Strict Redirects)
  // This must happen BEFORE blocking on file initialization.
  // If not owner, we redirect immediately and return null (or a loader)
  if (scape.source === "cloud") {
    // If not logged in, or logged in but not owner
    const isOwner = user && user.id === scape.authorId
    if (!isOwner) {
      const targetUrl = "/live/" + scape.id.trim()
      console.log("Redirecting non-owner to Live View:", targetUrl)
      return <Navigate to={targetUrl} replace />
    }
  }

  // 4. Filesystem Initialization (Owner Only)
  if (!isInitialized)
    return (
      <div className="h-screen w-screen">
        <LoadingOverlay message="Initializing Environment..." />
      </div>
    )
  // --- ACCESS CONTROL ---
  // If the scape exists (loaded), but the current user is NOT the author,
  // we redirect them to the "Runner/Player" view.
  // The Editor is strictly for the owner.
  // Note: We need to handle the case where user might be null (not logged in).
  // const { user } = useAuth() // Moved to top

  // Effect removed in favor of render-phase redirection logic above.

  if (!scape)
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Scape not found
      </div>
    )

  return (
    <>
      <ScapeLayout
        sidebar={
          <EditorActivityBar
            activeTool={activeTool}
            onToolSelect={setActiveTool}
            onSettingsClick={() => setIsSettingsOpen(true)}
            showPackages={scape && ENVIRONMENTS[scape.environment]?.capabilities.packages}
          />
        }
        headerTitle={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-xl font-bold text-transparent">
                CodeScapes
              </span>
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Editor
              </Badge>
              <span className="border-l pl-2 text-sm font-medium text-muted-foreground">
                {scape?.name}
              </span>
              <div className="ml-2 border-l pl-2">
                <SaveStatus
                  state={saveState}
                  lastSaved={lastSaved}
                  source={source as "local" | "cloud"}
                />
              </div>
            </div>
          </div>
        }
        headerActions={
          <>
            <div className="mr-2 flex items-center gap-1 border-r border-border/50 pr-4">
              <div
                className={cn(
                  "mr-2 flex items-center gap-2",
                  !isRunning && "pointer-events-none opacity-50"
                )}
              >
                <span className="text-xs font-medium text-muted-foreground">Auto</span>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  className="scale-75 data-[state=checked]:bg-green-500"
                />
              </div>

              {/* Refresh (Only when Running) */}
              {isRunning && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualRefresh}
                  className="h-8 w-8 px-0 text-muted-foreground hover:text-foreground"
                  title="Refresh Preview"
                  disabled={isRefreshing}
                >
                  <RotateCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
              )}

              <div className="flex items-center gap-2">
                {/* Stop / Start with Rotate Effect on Run */}
                <Button
                  // Logic for Run button:
                  // Primary/default state is "Run" (Green)
                  // Active state is "Stop" (Red)
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isRunning) {
                      setIsRunning(false)
                    } else {
                      handleRun()
                    }
                  }}
                  className={cn(
                    "h-8 w-8 px-0 transition-colors",
                    isRunning
                      ? "text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      : "text-green-500 hover:bg-green-500/10 hover:text-green-600"
                  )}
                  title={isRunning ? "Stop (Refs/Preview will reset)" : "Run"}
                >
                  {isRunning ? (
                    isRunnerBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Square className="h-4 w-4 fill-current" />
                    )
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Open the unified runner/player page
                    // This handles local/cloud fetching and VFS hydration automatically
                    window.open("/run/" + scape.id.trim(), "_blank")
                  }}
                >
                  <MonitorPlay className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>

              <ShareDialog
                scape={scape}
                onSyncComplete={(updated) => {
                  // Propagate updates (like is_public or dependencies) to the local store/UI
                  // This ensures the Editor (which relies on local state) sees the changes immediately.
                  updateScape({
                    is_public: updated.is_public,
                    dependencies: updated.dependencies,
                    thumbnail: updated.thumbnail,
                  })
                }}
              />

              <Button size="sm">
                <Zap className="mr-2 h-4 w-4" />
                Deploy
              </Button>
            </div>
          </>
        }
        headerEndActions={
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              window.location.href = "/dashboard"
            }}
            title="Exit to Dashboard"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Exit
          </Button>
        }
      >
        <ResizablePanelGroup
          ref={mainLayoutGroupRef}
          direction="horizontal"
          onLayout={(sizes) => {
            if (sizes.length === 2 && activeTool) {
              const sidebarSize = sizes[0]
              if (sidebarSize >= SIDEBAR_MIN - 5 && sidebarSize <= SIDEBAR_MAX + 5) {
                localStorage.setItem("codescape:layout:main", JSON.stringify(sizes))
              }
            }
          }}
        >
          {/* Sidebar - Persistent Size */}
          {activeTool && (
            <>
              <ResizablePanel
                id="sidebar-panel"
                order={1}
                defaultSize={getSafeLayout()[0]}
                minSize={SIDEBAR_MIN}
                maxSize={SIDEBAR_MAX}
                className="bg-muted/10"
              >
                {activeTool === "explorer" && (
                  <FileExplorer
                    files={fileTree}
                    onFileSelect={handleFileSelect}
                    activeFileId={activeFilePath || undefined}
                    onToggleFolder={handleToggleFolder}
                    onCreateFile={handleCreateFile}
                    onCreateFolder={handleCreateFolder}
                    onDelete={handleDelete}
                    onMove={handleMoveNode}
                  />
                )}
                {activeTool === "search" && (
                  <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
                    Search coming soon...
                  </div>
                )}
                {/* Dynamically check capabilities before rendering packages UI in sidebar content */}
                {activeTool === "packages" &&
                  scape &&
                  ENVIRONMENTS[scape.environment]?.capabilities.packages && (
                    <PackagePane
                      dependencies={optimisticDependencies ?? (scape?.dependencies || [])}
                      onDeletePackage={handleDeletePackage}
                    />
                  )}
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          <ResizablePanel
            id="editor-panel"
            order={2}
            defaultSize={activeTool ? getSafeLayout()[1] : 100}
          >
            <div className="flex h-full flex-col">
              <div className="flex h-full flex-row overflow-hidden">
                <div className="min-w-0 flex-1">
                  <ResizablePanelGroup
                    direction="horizontal"
                    onLayout={(sizes) => {
                      if (isPreviewOpen) {
                        localStorage.setItem("codescape:layout:workspace", JSON.stringify(sizes))
                      }
                    }}
                  >
                    <ResizablePanel
                      defaultSize={
                        isPreviewOpen ? getLayout("codescape:layout:workspace", [50, 50])[0] : 100
                      }
                      minSize={30}
                    >
                      <div className="flex h-full flex-col">
                        <div className="min-h-0 flex-1">
                          <ResizablePanelGroup
                            direction="vertical"
                            onLayout={(sizes) => {
                              if (isTerminalOpen)
                                localStorage.setItem(
                                  "codescape:layout:vertical",
                                  JSON.stringify(sizes)
                                )
                            }}
                          >
                            <ResizablePanel
                              defaultSize={
                                isTerminalOpen
                                  ? getLayout("codescape:layout:vertical", [75, 25])[0]
                                  : 100
                              }
                            >
                              {activeFile ? (
                                (() => {
                                  const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(
                                    activeFile.name
                                  )

                                  // 1. Handle Images (URL or Blob)
                                  if (isImage) {
                                    let src = ""
                                    if (typeof activeFile.content === "string") {
                                      src = activeFile.content
                                    } else if (activeFile.content instanceof Blob) {
                                      src = URL.createObjectURL(activeFile.content)
                                    } else if (activeFile.content instanceof Uint8Array) {
                                      src = URL.createObjectURL(
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        new Blob([activeFile.content as any])
                                      )
                                    }

                                    if (src) {
                                      return (
                                        <div className="flex h-full flex-col items-center justify-center overflow-hidden bg-muted/5 p-4">
                                          <div className="relative flex max-h-full max-w-full items-center justify-center rounded-lg border bg-[url('/grid.svg')] bg-center p-4 shadow-sm dark:bg-zinc-950">
                                            <img
                                              src={src}
                                              alt={activeFile.name}
                                              className="max-h-[80vh] max-w-full object-contain"
                                            />
                                          </div>
                                          <p className="mt-4 text-sm text-muted-foreground">
                                            {activeFile.name}
                                          </p>
                                        </div>
                                      )
                                    }
                                  }

                                  // 1.5 Handle PDFs
                                  if (activeFile.name.toLowerCase().endsWith(".pdf")) {
                                    let src = ""
                                    if (activeFile.content instanceof Blob) {
                                      src = URL.createObjectURL(activeFile.content)
                                    } else if (activeFile.content instanceof Uint8Array) {
                                      src = URL.createObjectURL(
                                        new Blob([activeFile.content as unknown as BlobPart], {
                                          type: "application/pdf",
                                        })
                                      )
                                    }

                                    if (src) {
                                      return (
                                        <div className="flex h-full flex-col bg-muted/5">
                                          <iframe
                                            src={src}
                                            className="h-full w-full border-none"
                                            title={activeFile.name}
                                          />
                                        </div>
                                      )
                                    }
                                  }

                                  // 2. Handle Text Code
                                  if (typeof activeFile.content === "string") {
                                    return (
                                      <CodeEditor
                                        key={activeFile.name}
                                        fileName={activeFile.name}
                                        initialValue={activeFile.content as string}
                                        language={activeFile.language}
                                        onChange={handleCodeChange}
                                        onValidate={handleValidate}
                                        files={deferredFiles}
                                        onRun={handleRun}
                                      />
                                    )
                                  }

                                  // 3. Fallback for other Binaries
                                  return (
                                    <div className="flex h-full flex-col items-center justify-center p-4 text-muted-foreground">
                                      <div className="mb-4 rounded-full bg-muted p-4">
                                        <div className="i-lucide-file-binary h-8 w-8 text-foreground/50" />
                                      </div>
                                      <p className="mb-2 font-medium">Binary File</p>
                                      <p className="text-sm">
                                        {activeFile.name} (
                                        {activeFile.content instanceof Blob
                                          ? `${(activeFile.content.size / 1024).toFixed(1)} KB`
                                          : activeFile.content instanceof Uint8Array
                                            ? `${(activeFile.content.byteLength / 1024).toFixed(1)} KB`
                                            : "Unknown size"}
                                        )
                                      </p>
                                      <p className="text-xs opacity-50">
                                        Cannot edit binary files directly.
                                      </p>
                                    </div>
                                  )
                                })()
                              ) : (
                                <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
                                  <p className="text-sm">Select a file to start editing</p>
                                </div>
                              )}
                            </ResizablePanel>
                            <ResizableHandle className={!isTerminalOpen ? "hidden" : ""} />
                            {isTerminalOpen && (
                              <ResizablePanel
                                defaultSize={getLayout("codescape:layout:vertical", [75, 25])[1]}
                                minSize={10}
                              >
                                <TerminalPane
                                  activeTab={terminalTab}
                                  onTabChange={handleTerminalTabChange}
                                  onClose={() => setIsTerminalOpen(false)}
                                  problems={problems}
                                  isCollapsed={false}
                                  files={files}
                                  scapeName={scape?.name}
                                  scapeId={id}
                                  onDeleteFile={deleteFileDirectly}
                                  onCreateFile={handleCreateFile}
                                  onUpdateFile={async (name, content) => updateFile(name, content)}
                                  outputLogs={outputLogs}
                                  onExecCommand={handleExecCommand}
                                  inputPrompt={inputPrompt}
                                  onInputSubmit={handleInputSubmit}
                                  isRunning={isRunning}
                                />
                              </ResizablePanel>
                            )}
                          </ResizablePanelGroup>
                        </div>
                        {!isTerminalOpen && (
                          <div className="h-9 shrink-0 border-t bg-background">
                            <TerminalPane
                              activeTab={terminalTab}
                              onTabChange={handleTerminalTabChange}
                              problems={problems}
                              isCollapsed={true}
                              files={files}
                              scapeName={scape?.name}
                              scapeId={id}
                              onDeleteFile={deleteFileDirectly}
                              outputLogs={outputLogs}
                              onExecCommand={handleExecCommand}
                              inputPrompt={inputPrompt}
                              onInputSubmit={handleInputSubmit}
                              isRunning={isRunning}
                            />
                          </div>
                        )}
                      </div>
                    </ResizablePanel>

                    <ResizableHandle className={!isPreviewOpen ? "hidden" : ""} />

                    <ResizablePanel
                      ref={previewPanelRef}
                      defaultSize={
                        isPreviewOpen ? getLayout("codescape:layout:workspace", [50, 50])[1] : 0
                      }
                      minSize={30}
                      collapsible={true}
                      collapsedSize={0}
                      onCollapse={() => {
                        if (isPreviewOpen) setIsPreviewOpen(false)
                      }}
                      onExpand={() => {
                        if (!isPreviewOpen) setIsPreviewOpen(true)
                      }}
                      className={!isPreviewOpen ? "min-w-0" : ""}
                    >
                      <PreviewPane
                        key={id} // Force remount on scape switch
                        scapeId={id}
                        ref={previewRef}
                        files={debouncedFiles}
                        onCollapse={() => setIsPreviewOpen(false)}
                        environment={scape?.environment}
                        isRunning={isRunning}
                        onOutput={handleOutput}
                        dependencies={scape?.dependencies}
                        onBusyChange={setIsRunnerBusy}
                        onInputRequest={handleInputRequest}
                        onFileSystemUpdate={handleFileSystemUpdate}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>

                {!isPreviewOpen && (
                  <div
                    className="flex w-9 cursor-pointer flex-col items-center border-l bg-muted/20 py-2 transition-colors hover:bg-muted/40"
                    onClick={() => setIsPreviewOpen(true)}
                    title="Show Preview"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <PanelRightOpen className="h-4 w-4" />
                    </Button>
                    <span
                      className="mt-4 select-none text-xs font-medium text-muted-foreground"
                      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                    >
                      Preview
                    </span>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ScapeLayout>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              <span className="px-1 font-semibold text-foreground">"{itemToDelete}"</span>
              and remove it from your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  )
}
