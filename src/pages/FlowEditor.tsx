import { useState, useRef, useEffect, useMemo } from "react"
import { useParams, Navigate } from "react-router-dom"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

import { Header } from "@/components/layout/Header"
import { PreviewPane, type PreviewPaneHandle } from "@/components/editor/PreviewPane"
import { EditorActivityBar } from "@/components/layout/EditorActivityBar"
import { FileExplorer } from "@/components/editor/FileExplorer"
import { buildFileTree } from "@/lib/file-tree"
import { Button } from "@/components/ui/button"
import { Flag, Maximize, LogOut, FileCode, MousePointer2, Zap } from "lucide-react"
import { BlockEditor, type BlockEditorHandle } from "@/components/editor/BlockEditor"
import { BlockPalette } from "@/components/editor/BlockPalette"
import { LoadingOverlay } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/useAuth"
import { useScapeLoading } from "@/hooks/useScapeLoading"
import { useFileSystem } from "@/hooks/useFileSystem"
import type { FileType } from "@/types/file"
import type { FileNode } from "@/lib/file-tree"
import type { ActivityTool } from "@/components/layout/EditorActivityBar"
import { CodeScapeLogo } from "@/components/brand/Logo"

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

  // 4. LAYOUT STATE
  const [activeTool, setActiveTool] = useState<string | null>("Motion")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isEditorReady, setIsEditorReady] = useState(false)

  // 5. ACTIVITY BAR CONFIG
  const topTools: ActivityTool[] = [
    { id: "Motion", icon: MousePointer2, label: "Motion" },
    { id: "Events", icon: Zap, label: "Events" }, // Or Play for Events? Zap is good for "When..."
    { id: "Control", icon: FileCode, label: "Control" }, // FileCode is a placeholder, maybe Workflow?
  ]

  const bottomTools: ActivityTool[] = [{ id: "explorer", icon: FileCode, label: "Explorer" }]

  const handleToggleFolder = (path: string) => {
    const next = new Set(expandedFolders)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    setExpandedFolders(next)
  }

  // 6. COMPUTED STATE (Moved up before guards)
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCodeRef = useRef<string>("")

  const handleCodeChange = (code: string, json: object) => {
    if (code !== lastCodeRef.current) {
      previewRef.current?.updateScript?.(code)
      lastCodeRef.current = code
    }

    if (json) {
      localStorage.setItem(`flow_backup_${id}`, JSON.stringify(json))
    }

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

  // No longer need separate handleCategoryClick since EditorActivityBar handles it via activeTool

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
  if (scape && scape.source === "cloud") {
    const isOwner = user && user.id === scape.authorId
    if (!isOwner) {
      return <Navigate to={`/live/${scape.id}`} replace />
    }
  }

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
            <CodeScapeLogo size={32} />
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
          topTools={topTools}
          bottomTools={bottomTools}
        />

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* 2b. SIDEBAR (Explorer OR Block Palette) */}
          {activeTool && (
            <>
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={40}
                className="flex flex-col border-r border-border bg-muted/5"
              >
                {activeTool === "explorer" ? (
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
                ) : (
                  // It must be a category (Motion, Events, Control)
                  <BlockPalette category={activeTool} editorRef={blockEditorRef} />
                )}
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* 2c. WORKSPACE */}
          <ResizablePanel defaultSize={activeTool ? 80 : 100}>
            <div className="flex h-full w-full">
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
