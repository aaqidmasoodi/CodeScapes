import { useState, useRef, useEffect, useMemo } from "react"
import { useParams, Navigate } from "react-router-dom"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

import { Header } from "@/components/layout/Header"
import { PreviewPane, type PreviewPaneHandle } from "@/components/editor/PreviewPane"
import { EditorActivityBar } from "@/components/layout/EditorActivityBar"
import { FileExplorer } from "@/components/editor/FileExplorer"
import { buildFileTree } from "@/lib/file-tree"
import { Button } from "@/components/ui/button"
import { Flag, Maximize, LogOut } from "lucide-react"
import {
  BlockEditor,
  type BlockEditorHandle,
  TOOLBOX_CATEGORIES,
} from "@/components/editor/BlockEditor"
import { LoadingOverlay } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/useAuth"
import { useScapeLoading } from "@/hooks/useScapeLoading"
import { useFileSystem } from "@/hooks/useFileSystem"
import type { FileType } from "@/types/file"
import type { FileNode } from "@/lib/file-tree"

const StopIcon = ({ className }: { className?: string }) => (
  <div
    className={`rounded-sm bg-current ${className}`}
    style={{
      clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
    }}
  />
)

export default function FlowEditor() {
  const { scapeId } = useParams()
  const id = scapeId || ""
  const { user } = useAuth()

  // 1. DATA LOADING
  const { scape, source, isLoading } = useScapeLoading(id)

  // 2. FILESYSTEM
  const { files, isInitialized, updateFile, createFile } = useFileSystem(id, source)

  // 3. STATE & REFS (Moved up before guards)
  const [isRunning, setIsRunning] = useState(false)
  const previewRef = useRef<PreviewPaneHandle>(null)
  const blockEditorRef = useRef<BlockEditorHandle>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 4. LAYOUT STATE
  const [activeTool, setActiveTool] = useState<
    "explorer" | "search" | "packages" | "secrets" | null
  >("explorer")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isEditorReady, setIsEditorReady] = useState(false)

  const handleToggleFolder = (path: string) => {
    const next = new Set(expandedFolders)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    setExpandedFolders(next)
  }

  // 5. COMPUTED STATE (Moved up before guards)
  // File Tree Construction
  const fileTree = useMemo(() => {
    if (!files) return []
    const tree = buildFileTree(files)
    const applyExpansion = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => ({
        ...node,
        isOpen: expandedFolders.has(node.path),
        children: node.children ? applyExpansion(node.children) : undefined,
      }))
    return applyExpansion(tree)
  }, [files, expandedFolders])

  const filteredFiles = useMemo(() => {
    if (!files) return []
    return files.filter((f) => f.name !== "script.js" && f.name !== "blocks.json")
  }, [files])

  // 6. EFFECTS (Moved up before guards)
  // 5. EFFECTS (Moved up before guards)
  const blocksLoaded = useRef(false)

  useEffect(() => {
    if (!isInitialized || !files || !isEditorReady) return

    // 1. Inject Script (Only on change, handled by filteredFiles logic mostly, but good for initial)
    const script = files.find((f) => f.name === "script.js")
    if (script && script.content && previewRef.current) {
      setTimeout(() => {
        previewRef.current?.updateScript?.(String(script.content))
      }, 1000)
    }

    // 2. Load Blocks (ONLY ONCE)
    if (!blocksLoaded.current) {
      const blocksFile = files.find((f) => f.name === "blocks.json")
      const localBackup = localStorage.getItem(`flow_backup_${id}`)

      // Priority: DB -> Local Backup
      // Actually, Local Backup might be fresher if debounce didn't finish?
      // For now, let's prefer DB, but fall back to Local.
      // Or better: Check timestamps? No timestamps easily available.
      // Let's assume: If DB has it, use it. If not, try Local.

      let jsonToLoad = null

      if (blocksFile && blocksFile.content) {
        try {
          jsonToLoad = JSON.parse(String(blocksFile.content))
          console.log("[FlowEditor] Loading blocks from Database")
        } catch (e) {
          console.error("Failed to parse DB blocks", e)
        }
      } else if (localBackup) {
        try {
          jsonToLoad = JSON.parse(localBackup)
          console.log("[FlowEditor] Loading blocks from LocalStorage Backup")
        } catch (e) {
          console.error("Failed to parse LocalStorage blocks", e)
        }
      }

      if (jsonToLoad && blockEditorRef.current) {
        try {
          blockEditorRef.current.loadJSON(jsonToLoad)
          blocksLoaded.current = true
        } catch (e) {
          console.error("Failed to load blocks into workspace", e)
        }
      } else if (blockEditorRef.current) {
        // If no file exists anywhere, mark as loaded (empty workspace)
        blocksLoaded.current = true
      }
    }
  }, [isInitialized, files, isEditorReady, id])

  // 6. HANDLERS
  // 6. HANDLERS
  // 6. HANDLERS
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCodeRef = useRef<string>("")

  const handleCodeChange = (code: string, json: object) => {
    // 1. Runtime Update (INTELLIGENT)
    // Only update the runtime if the generated CODE actually changed.
    // Moving blocks visually (changing JSON) should NOT trigger a script update.
    if (code !== lastCodeRef.current) {
      previewRef.current?.updateScript?.(code)
      lastCodeRef.current = code
    }

    // 2. Persistence (Storage) - LAYERING

    // Layer A: IMMEDIATE Local Storage (Safety Net)
    // Saves every single move instantly to local storage so you never lose a drag.
    if (json) {
      localStorage.setItem(`flow_backup_${id}`, JSON.stringify(json))
    }

    // Layer B: DEBOUNCED Database Save (Efficiency)
    // We debounce the actual Database/File writes to prevent spamming the server.
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      // A. Save Script
      const scriptExists = files.some((f) => f.name === "script.js")
      if (scriptExists) {
        updateFile("script.js", code)
      } else {
        createFile("script.js", "javascript", code)
      }

      // B. Save Blocks JSON (The Workspace State)
      if (json) {
        const jsonContent = JSON.stringify(json)
        const blocksExists = files.some((f) => f.name === "blocks.json")
        if (blocksExists) {
          updateFile("blocks.json", jsonContent)
        } else {
          createFile("blocks.json", "json", jsonContent)
        }
      }
      console.log("[FlowEditor] Auto-saved blocks & script to DB")
    }, 1000) // 1s debounce
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    if (blockEditorRef.current) {
      blockEditorRef.current.activateCategory(category)
    }
  }

  const handleRun = () => {
    console.log("[FlowEditor] Run Button Clicked")
    setIsRunning(true)
    previewRef.current?.run?.()
  }

  const handleStop = () => {
    setIsRunning(false)
    previewRef.current?.stop?.()
  }

  // 7. GUARDS (Moved down after all hooks)
  // ACCESS CONTROL
  if (scape && scape.source === "cloud") {
    const isOwner = user && user.id === scape.authorId
    if (!isOwner) {
      return <Navigate to={`/live/${scape.id}`} replace />
    }
  }

  // LOADING STATES
  if (!id) return <div className="flex h-screen items-center justify-center">Invalid ID</div>
  if (isLoading)
    return (
      <div className="h-screen w-screen">
        <LoadingOverlay message="Loading Scape..." />
      </div>
    )
  if (!scape)
    return <div className="flex h-screen items-center justify-center">Scape not found</div>
  if (!isInitialized)
    return (
      <div className="h-screen w-screen">
        <LoadingOverlay message="Initializing..." />
      </div>
    )

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* 1. HEADER */}
      <Header
        customTitle={
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-xl font-bold text-transparent">
              CodeScape
            </span>
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
              canvas
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10 hover:text-green-400"
              onClick={handleRun}
              title="Go"
            >
              <Flag className="h-5 w-5 fill-current" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={handleStop}
              title="Stop"
            >
              <StopIcon className="h-4 w-4" />
            </Button>

            <div className="mx-2 h-4 w-[1px] bg-border" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Fullscreen Preview"
              onClick={() => {
                const liveUrl = `/live/${scapeId || "demo"}`
                window.open(liveUrl, "_blank")
              }}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        }
        endActions={
          <Button
            size="sm"
            className="gap-2 bg-red-500 text-white hover:bg-red-600"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <LogOut className="h-4 w-4" />
            Exit
          </Button>
        }
      />

      {/* 2. MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* 2a. GLOBAL ACTIVITY BAR */}
        <EditorActivityBar
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          onSettingsClick={() => {}}
          showPackages={false}
        />

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* 2b. SIDEBAR (Explorer) */}
          {activeTool === "explorer" && (
            <>
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={40}
                className="flex flex-col border-r border-border bg-muted/5"
              >
                <FileExplorer
                  files={fileTree}
                  onFileSelect={() => {}}
                  onToggleFolder={handleToggleFolder}
                  onCreateFile={(name, type, content) =>
                    createFile(name, type as FileType, content)
                  }
                  onCreateFolder={(name) => createFile(name, "folder")}
                  onDelete={(path) => console.log("Delete TODO", path)} // Implement if needed
                  onMove={() => {}} // Implement if needed
                />
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* 2c. WORKSPACE */}
          <ResizablePanel defaultSize={activeTool ? 80 : 100}>
            <div className="flex h-full w-full">
              {/* CUSTOM ACTIVITY BAR (The "Tray Selector") */}
              <div className="flex w-20 flex-col items-center gap-4 border-r border-border bg-muted/10 py-4">
                {TOOLBOX_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`group flex w-full flex-col items-center justify-center gap-1 px-1`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full transition-transform group-hover:scale-110 ${selectedCategory === cat.name ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
                      style={{
                        backgroundColor: cat.colour,
                        boxShadow:
                          selectedCategory === cat.name ? `0 0 10px ${cat.colour}80` : "none",
                      }}
                    />
                    <span
                      className={`text-[10px] font-medium transition-colors ${selectedCategory === cat.name ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                    >
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>

              <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* CENTER (Blockly Editor) */}
                <ResizablePanel defaultSize={70} minSize={30}>
                  <BlockEditor
                    ref={blockEditorRef}
                    onChange={handleCodeChange}
                    onInit={() => setIsEditorReady(true)}
                  />
                </ResizablePanel>

                <ResizableHandle />

                {/* PREVIEW */}
                <ResizablePanel defaultSize={30} minSize={20}>
                  <PreviewPane
                    ref={previewRef}
                    files={filteredFiles}
                    scapeId={scapeId || "flow-demo"}
                    environment="flowscape"
                    isRunning={isRunning}
                    showStoppedOverlay={false}
                    onCollapse={() => {}}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
