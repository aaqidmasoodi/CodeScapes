import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useParams } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"
import * as ResizablePrimitive from "react-resizable-panels"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { ScapeLayout } from "@/layouts/ScapeLayout"
import { CodeEditor } from "@/components/editor/CodeEditor"
import { FileExplorer } from "@/components/editor/FileExplorer"
import { PreviewPane } from "@/components/editor/PreviewPane"
import { TerminalPane, type TerminalTab } from "@/components/editor/TerminalPane"
import { EditorActivityBar } from "@/components/layout/EditorActivityBar"
import type { ScapeFile } from "@/types/file"
import type { Problem } from "@/types/problem"
import { db } from "@/lib/db"
import { buildFileTree, type FileNode } from "@/lib/file-tree"
import { MonitorPlay, Zap, LogOut } from "lucide-react"

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
  // Force HMR update
  const id = parseInt(scapeId || "0")

  // Load Scape and Files
  const scape = useLiveQuery(() => db.scapes.get(id), [id])
  const dbFiles = useLiveQuery(() => db.files.where("scapeId").equals(id).toArray(), [id])

  // Local State
  const [files, setFiles] = useState<ScapeFile[]>([])
  const [debouncedFiles, setDebouncedFiles] = useState<ScapeFile[]>([])
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // --- PERSISTENT STATE ---

  // Activity Bar State
  const [activeTool, setActiveTool] = usePersistentState<"explorer" | "search" | "settings" | null>(
    "codescape:ui:activeTool",
    "explorer"
  )

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

  const mainLayoutGroupRef = useRef<ResizablePrimitive.ImperativePanelGroupHandle>(null)

  // Force strict layout when Sidebar opens
  useEffect(() => {
    if (activeTool === "explorer" && mainLayoutGroupRef.current) {
      const target = getSafeLayout()
      mainLayoutGroupRef.current.setLayout(target)
    }
  }, [activeTool])

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

  // Initialize files from DB and handle Active File Redirection
  useEffect(() => {
    if (dbFiles) {
      const mappedFiles: ScapeFile[] = dbFiles.map((f) => ({
        id: f.id,
        name: f.name,
        language: f.language as ScapeFile["language"],
        content: f.content,
      }))

      // Update local files
      setFiles(mappedFiles)
      setDebouncedFiles(mappedFiles)

      // Handle Active File Logic
      if (mappedFiles.length > 0) {
        // If we have a stored path, verify it still exists
        const storedExists = mappedFiles.some((f) => f.name === activeFilePath)

        if (!activeFilePath || !storedExists) {
          // Default to index.html or first file
          const defaultFile =
            mappedFiles.find((f) => f.name === "index.html") ||
            mappedFiles.find((f) => f.language !== "folder")

          if (defaultFile) {
            setActiveFilePath(defaultFile.name)
          }
        }
      } else {
        setFiles([])
        if (activeFilePath) setActiveFilePath(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbFiles, activeFilePath])

  // Sync Debounced Files (Preview) & Save to DB
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only proceed if we have initialized
      if (files.length === 0) return

      setDebouncedFiles(files)

      // Auto-save to DB
      if (id) {
        files.forEach((file) => {
          const dbFile = dbFiles?.find((df) => df.name === file.name)
          if (dbFile && dbFile.content !== file.content) {
            db.files.update(dbFile.id, { content: file.content })
          }
        })
        db.scapes.update(id, { updatedAt: new Date() })
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [files, id, dbFiles])

  // --- HANDLERS ---

  const handleFileSelect = (file: ScapeFile) => {
    setActiveFilePath(file.name)
  }

  const handleCodeChange = (newContent: string | undefined) => {
    if (!activeFile || newContent === undefined) return
    setFiles((prev) =>
      prev.map((f) => (f.name === activeFile.name ? { ...f, content: newContent } : f))
    )
    setRuntimeProblems([])
  }

  const handleCreateFile = async (fileName: string) => {
    if (!fileName) return
    if (files.some((f) => f.name === fileName)) {
      alert("File already exists")
      return
    }
    const language = fileName.endsWith(".css")
      ? "css"
      : fileName.endsWith(".html")
        ? "html"
        : "javascript"

    await db.files.add({
      scapeId: id,
      name: fileName,
      language: language,
      content: "",
    })
    // Auto-select new file
    setActiveFilePath(fileName)
  }

  const handleCreateFolder = async (folderName: string) => {
    if (!folderName) return
    if (files.some((f) => f.name === folderName)) return

    await db.files.add({
      scapeId: id,
      name: folderName,
      language: "folder",
      content: "",
    })
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
    const filesToDelete = files.filter((f) => f.name === path || f.name.startsWith(path + "/"))
    const dbFilesToDelete = dbFiles?.filter((df) => filesToDelete.some((f) => f.name === df.name))

    if (dbFilesToDelete && dbFilesToDelete.length > 0) {
      await db.files.bulkDelete(dbFilesToDelete.map((f) => f.id))
    }

    if (activeFilePath && (activeFilePath === path || activeFilePath.startsWith(path + "/"))) {
      setActiveFilePath(null)
    }
  }

  const handleMoveNode = async (oldPath: string, newPath: string) => {
    if (files.some((f) => f.name === newPath)) return

    const folderEntry = files.find((f) => f.name === oldPath && f.language === "folder")
    if (folderEntry) await db.files.update(folderEntry.id!, { name: newPath })

    const filesToMove = files.filter((f) => f.name === oldPath || f.name.startsWith(oldPath + "/"))
    if (filesToMove.length > 0) {
      const updates = filesToMove.map((f) => ({
        key: f.id!,
        changes: { name: newPath + f.name.slice(oldPath.length) },
      }))
      await Promise.all(updates.map((u) => db.files.update(u.key, u.changes)))
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

  // --- PROBLEMS & VALIDATION ---
  const [syntaxProblems, setSyntaxProblems] = useState<Problem[]>([])
  const [runtimeProblems, setRuntimeProblems] = useState<Problem[]>([])

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
  if (!scape && !dbFiles)
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading Scape...</p>
        </div>
      </div>
    )
  if (!scape && dbFiles)
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Scape not found
      </div>
    )

  return (
    <>
      <ScapeLayout
        sidebar={<EditorActivityBar activeTool={activeTool} onToolSelect={setActiveTool} />}
        headerTitle={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-xl font-bold text-transparent">
                CodeScape Editor
              </span>
              <span className="border-l pl-2 text-sm font-medium text-muted-foreground">
                {scape?.name}
              </span>
            </div>
          </div>
        }
        headerActions={
          <>
            <Button variant="ghost" size="sm">
              <MonitorPlay className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button size="sm">
              <Zap className="mr-2 h-4 w-4" />
              Deploy
            </Button>
          </>
        }
        headerEndActions={
          <Button
            variant="destructive"
            size="sm"
            onClick={() => (window.location.href = "/dashboard")}
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
            if (sizes.length === 2 && activeTool === "explorer") {
              const sidebarSize = sizes[0]
              if (sidebarSize >= SIDEBAR_MIN - 5 && sidebarSize <= SIDEBAR_MAX + 5) {
                localStorage.setItem("codescape:layout:main", JSON.stringify(sizes))
              }
            }
          }}
        >
          {/* Sidebar - Persistent Size */}
          {activeTool === "explorer" && (
            <>
              <ResizablePanel
                id="sidebar-panel"
                order={1}
                defaultSize={getSafeLayout()[0]}
                minSize={SIDEBAR_MIN}
                maxSize={SIDEBAR_MAX}
                className="bg-muted/10"
              >
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
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          <ResizablePanel
            id="editor-panel"
            order={2}
            defaultSize={activeTool === "explorer" ? getSafeLayout()[1] : 100}
          >
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup
                  direction="horizontal"
                  onLayout={(sizes) =>
                    localStorage.setItem("codescape:layout:workspace", JSON.stringify(sizes))
                  }
                >
                  <ResizablePanel
                    defaultSize={getLayout("codescape:layout:workspace", [50, 50])[0]}
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
                              <CodeEditor
                                key={activeFile.name}
                                fileName={activeFile.name}
                                initialValue={activeFile.content}
                                language={activeFile.language}
                                onChange={handleCodeChange}
                                onValidate={handleValidate}
                                files={files}
                              />
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
                                onDeleteFile={deleteFileDirectly}
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
                            onDeleteFile={deleteFileDirectly}
                          />
                        </div>
                      )}
                    </div>
                  </ResizablePanel>

                  <ResizableHandle />

                  <ResizablePanel
                    defaultSize={getLayout("codescape:layout:workspace", [50, 50])[1]}
                    minSize={30}
                  >
                    <PreviewPane files={debouncedFiles} />
                  </ResizablePanel>
                </ResizablePanelGroup>
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
    </>
  )
}
