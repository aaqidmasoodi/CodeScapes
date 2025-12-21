import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useParams, Navigate } from "react-router-dom"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

import { Header } from "@/components/layout/Header"
import { PreviewPane, type PreviewPaneHandle } from "@/components/editor/PreviewPane"
import { EditorActivityBar } from "@/components/layout/EditorActivityBar"
import { FileExplorer } from "@/components/editor/FileExplorer"
import { buildFileTree } from "@/lib/file-tree"
import { Button } from "@/components/ui/button"
import { Flag, Maximize, LogOut, FileCode, MousePointer2, Zap, Eye } from "lucide-react"
import { BlockEditor, type BlockEditorHandle } from "@/components/editor/BlockEditor"
import { BlockPalette } from "@/components/editor/BlockPalette"
import { LoadingOverlay } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/useAuth"
import { useScapeLoading } from "@/hooks/useScapeLoading"
import { useFileSystem } from "@/hooks/useFileSystem"
import { useTheme } from "next-themes"
import type { FileNode } from "@/lib/file-tree"
import type { FileType } from "@/types/file"
import type { ActivityTool } from "@/components/layout/EditorActivityBar"
import { CodeScapeLogo } from "@/components/brand/Logo"
import { useFlowStore, initAutosave } from "@/stores/flowStore"
import { SpritePane } from "@/components/editor/SpritePane"


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
  const { resolvedTheme } = useTheme()

  // 1. DATA LOADING
  const { scape, source, isLoading } = useScapeLoading(id)

  // 2. FILESYSTEM
  const { files, isInitialized: isFsInitialized, updateFile, createFile } = useFileSystem(id, source)

  // 3. FLOW STORE (Global State)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = useFlowStore() as any

  // 4. STATE & REFS
  const [isRunning, setIsRunning] = useState(false)
  const previewRef = useRef<PreviewPaneHandle>(null)
  const blockEditorRef = useRef<BlockEditorHandle>(null)
  const [activeTool, setActiveTool] = useState<string | null>("Motion")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isEditorReady, setIsEditorReady] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 5. HYDRATION & AUTOSAVE
  useEffect(() => {
    // Only hydrate once FS is ready (to check for project.json)
    if (!id || !isFsInitialized) return

    // Find project.json if exists
    const projectFile = files.find(f => f.name === "project.json")
    let initialProject = null
    if (projectFile && projectFile.content) {
      try {
        initialProject = JSON.parse(String(projectFile.content))
      } catch (e) { console.error("Bad project.json", e) }
    }

    store.hydrate(id, initialProject)

  }, [id, isFsInitialized]) // Run once when FS is ready

  // Initialize Autosave Subscription (IndexedDB - Immediate)
  useEffect(() => {
    if (!id) return
    const unsubscribe = initAutosave(id)
    return () => unsubscribe()
  }, [id])

  // 6. SYNC BACKGROUND FILE (Explicit Save Helper)
  // We removed the generic useEffect loop to prevent "Runtime Update -> Store -> File -> Preview Reload" loop.
  // Now we strictly save only on User Actions.

  const saveProjectFile = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      // Use latest store state
      const currentProject = useFlowStore.getState().project
      const projectJson = JSON.stringify(currentProject, null, 2)
      const file = files.find(f => f.name === "project.json")
      if (file) {
        updateFile("project.json", projectJson)
      } else {
        createFile("project.json", "json", projectJson)
      }
      console.log("[FlowEditor] Persisted project.json")
    }, 1000)
  }, [files, updateFile, createFile])


  // 7. WORKSPACE SWITCHING & INITIAL LOAD
  // Initialize as null to force first load
  const prevTargetIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Determine active target object
    const target = store.project.targets.find((t: any) => t.id === store.activeTargetId)

    if (target && blockEditorRef.current && isEditorReady) {
      // Load if ID changed OR if it's the very first run (prev is null)
      if (prevTargetIdRef.current !== store.activeTargetId) {
        console.log("[FlowEditor] Loading Blocks for", target.name)
        // Load Blocks
        if (target.blocks && Object.keys(target.blocks).length > 0) {
          blockEditorRef.current.loadJSON(target.blocks)
        } else {
          blockEditorRef.current.clear()
        }
      }
      prevTargetIdRef.current = store.activeTargetId
    }
  }, [store.activeTargetId, isEditorReady, store.project.targets])


  // 8. HANDLERS (With Save)

  // A. Block/Code Changes
  const handleCodeChange = (code: string, json: object) => {
    store.updateTargetBlocks(store.activeTargetId, json)
    store.updateTargetCode(store.activeTargetId, code)
    saveProjectFile() // Trigger File Save
  }

  // B. Sprite/Backdrop Updates (Wrap store actions with save)
  const handleAddSprite = (asset?: any) => {
    store.addSprite(asset)
    saveProjectFile()
  }

  const handleAddBackdrop = (asset: any) => {
    store.addBackdrop(asset)
    saveProjectFile()
  }

  const handleUpdateTarget = (id: string, data: any) => {
    store.updateTarget(id, data)
    saveProjectFile()
  }

  const handleDeleteBackdrop = (id: string) => {
    store.deleteBackdrop(id)
    saveProjectFile()
  }

  const handleDeleteSprite = (id: string) => {
    store.deleteTarget(id)
    saveProjectFile()
  }

  const handleRun = () => {
    console.log("[FlowEditor] Run")
    setIsRunning(true)
    previewRef.current?.run?.()
  }

  const handleStop = () => {
    setIsRunning(false)
    previewRef.current?.stop?.()
  }

  // LIVE SYNC (Receive updates from Engine)
  // This updates store but DOES NOT trigger saveProjectFile
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data
      if (type === "FlowScape:StateUpdate") {
        store.syncTargets(payload)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [store.syncTargets])


  // 9. COMPUTED UI
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
    return files.filter((f) => f.name !== "script.js" && f.name !== "blocks.json" && f.name !== "project.json")
  }, [files])

  const topTools: ActivityTool[] = [
    { id: "Motion", icon: MousePointer2, label: "Motion" },
    { id: "Looks", icon: Eye, label: "Looks" },
    { id: "Events", icon: Zap, label: "Events" },
    { id: "Control", icon: FileCode, label: "Control" },
  ]
  const bottomTools: ActivityTool[] = [{ id: "explorer", icon: FileCode, label: "Explorer" }]

  const handleToggleFolder = (path: string) => {
    const next = new Set(expandedFolders)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    setExpandedFolders(next)
  }

  // GUARDS
  if (scape && scape.source === "cloud") {
    const isOwner = user && user.id === scape.authorId
    if (!isOwner) return <Navigate to={`/live/${scape.id}`} replace />
  }

  if (!id) return <div className="flex h-screen items-center justify-center">Invalid ID</div>
  if (isLoading || !store.isHydrated)
    return (
      <div className="h-screen w-screen">
        <LoadingOverlay message={isLoading ? "Loading Scape..." : "Restoring Session..."} />
      </div>
    )
  if (!scape) return <div className="flex h-screen items-center justify-center">Scape not found</div>

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
          onSettingsClick={() => { }}
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
                    onFileSelect={() => { }}
                    onToggleFolder={handleToggleFolder}
                    onCreateFile={(name, type, content) =>
                      createFile(name, type as FileType, content)
                    }
                    onCreateFolder={(name) => createFile(name, "folder")}
                    onDelete={(path) => console.log("Delete TODO", path)} // Implement if needed
                    onMove={() => { }} // Implement if needed
                  />
                ) : (
                  // It must be a category (Motion, Events, Control)
                  <BlockPalette
                    category={activeTool}
                    editorRef={blockEditorRef}
                    theme={resolvedTheme as "light" | "dark"}
                  />
                )}
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* 2c. WORKSPACE */}
          <ResizablePanel defaultSize={activeTool ? 80 : 100}>
            <div className="flex h-full w-full">
              <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* CENTER: BlockEditor */}
                <ResizablePanel defaultSize={55} minSize={30} className="relative">
                  <BlockEditor
                    ref={blockEditorRef}
                    onChange={handleCodeChange}
                    onInit={() => setIsEditorReady(true)}
                    theme={resolvedTheme === "light" ? "light" : "dark"}
                  />
                  {/* Overlay current target name */}
                  <div className="absolute left-4 top-4 z-10 rounded-md bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur border border-border/50 shadow-sm">
                    Editing: <span className="text-foreground font-bold">
                      {store.project.targets.find((t: any) => t.id === store.activeTargetId)?.name || "?"}
                    </span>
                  </div>
                </ResizablePanel>

                <ResizableHandle />

                {/* RIGHT: Stack (Preview + Sprites) */}
                <ResizablePanel defaultSize={45} minSize={20}>
                  <ResizablePanelGroup direction="vertical">

                    {/* Top: Preview */}
                    <ResizablePanel defaultSize={50} minSize={20}>
                      <PreviewPane
                        ref={previewRef}
                        files={filteredFiles}
                        scapeId={scapeId || "flow-demo"}
                        environment="flowscape"
                        isRunning={isRunning}
                        showStoppedOverlay={false}
                        onCollapse={() => { }}
                        project={store.project} // ZERO-LATENCY SYNC
                      />
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Bottom: Sprite Pane */}
                    <ResizablePanel defaultSize={50} minSize={20}>
                      <SpritePane
                        targets={store.project.targets}
                        activeTargetId={store.activeTargetId}
                        onSelect={store.setActiveTarget}
                        onAdd={handleAddSprite}
                        onAddBackdrop={handleAddBackdrop}
                        onUpdate={handleUpdateTarget}
                        onDelete={handleDeleteSprite}
                        onDeleteBackdrop={handleDeleteBackdrop}
                      />
                    </ResizablePanel>

                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
