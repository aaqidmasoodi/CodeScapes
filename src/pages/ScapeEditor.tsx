
import { useState, useEffect, useMemo, useCallback } from "react" // Added useCallback
import { useParams } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"


import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { ScapeLayout } from "@/layouts/ScapeLayout"
import { CodeEditor } from "@/components/editor/CodeEditor"
import { FileExplorer, type FileNode } from "@/components/editor/FileExplorer"
import { PreviewPane } from "@/components/editor/PreviewPane"
import { TerminalPane, type TerminalTab } from "@/components/editor/TerminalPane"
import { EditorActivityBar } from "@/components/layout/EditorActivityBar"
import type { ScapeFile } from "@/types/file"
import type { Problem } from "@/types/problem"
import { db } from "@/lib/db"
import { MonitorPlay, Zap, LogOut } from "lucide-react"

export default function ScapeEditor() {
  const { scapeId } = useParams()
  // Force HMR update
  const id = parseInt(scapeId || "0")

  // Load Scape and Files
  const scape = useLiveQuery(() => db.scapes.get(id), [id])
  const dbFiles = useLiveQuery(() => db.files.where("scapeId").equals(id).toArray(), [id])

  // Local State for Editor
  const [files, setFiles] = useState<ScapeFile[]>([])
  const [activeFile, setActiveFile] = useState<ScapeFile | null>(null)
  const [debouncedFiles, setDebouncedFiles] = useState<ScapeFile[]>([])

  // Initialize files from DB
  useEffect(() => {
    if (dbFiles) {
      if (dbFiles.length > 0) {
        const mappedFiles: ScapeFile[] = dbFiles.map(f => ({
          name: f.name,
          language: f.language as any,
          content: f.content
        }))
        setFiles(mappedFiles)

        // Set active file if not set
        if (!activeFile) {
          setActiveFile(mappedFiles.find(f => f.name === 'index.html') || mappedFiles[0])
        }
        setDebouncedFiles(mappedFiles)
      } else {
        // Handle case where scape exists but has no files (shouldn't happen with templates, but good for safety)
        setFiles([])
        setActiveFile(null)
      }
    }
  }, [dbFiles])

  // Sync Debounced Files (for Preview) & Save to DB
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFiles(files)

      // Auto-save to DB
      if (id && files.length > 0) {
        files.forEach(file => {
          // Find matching DB file to get ID (optimized update) or use bulkPut
          const dbFile = dbFiles?.find(df => df.name === file.name)
          if (dbFile) {
            if (dbFile.content !== file.content) {
              db.files.update(dbFile.id, { content: file.content })
            }
          }
        })
        // Update updated_at
        db.scapes.update(id, { updatedAt: new Date() })
      }

    }, 1000)
    return () => clearTimeout(timer)
  }, [files, id, dbFiles])

  const handleFileSelect = (file: ScapeFile) => {
    setActiveFile(file)
  }

  const handleCodeChange = (newContent: string | undefined) => {
    if (!activeFile || newContent === undefined) return

    setFiles((prev) =>
      prev.map((f) =>
        f.name === activeFile.name ? { ...f, content: newContent } : f
      )
    )
    // Also update active file reference so editor doesn't lose sync if needed (though key handles it)
    setActiveFile((prev) => prev ? ({ ...prev, content: newContent }) : null)
    // Clear runtime errors when code changes (optimistic)
    setRuntimeProblems([])
  }

  // Terminal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(true)
  const [terminalTab, setTerminalTab] = useState<TerminalTab>("terminal")

  const handleTerminalTabChange = (tab: TerminalTab) => {
    setTerminalTab(tab)
    if (!isTerminalOpen) {
      setIsTerminalOpen(true)
    }
  }

  // Problem State
  const [syntaxProblems, setSyntaxProblems] = useState<Problem[]>([])
  const [runtimeProblems, setRuntimeProblems] = useState<Problem[]>([])

  // Listen for runtime errors from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'RUNTIME_ERROR') {
        const error = event.data.payload
        if (!error || typeof error !== 'object') return

        setRuntimeProblems(prev => {
          // Avoid duplicates
          if (prev.some(p => p.message === error.message && p.line === error.line)) return prev
          return [...prev, {
            id: crypto.randomUUID(),
            file: 'index.html',
            message: error.message || 'Unknown Runtime Error',
            line: error.line || 0,
            column: error.column || 0,
            severity: 'error',
            source: 'runtime'
          }]
        })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])


  // Aggregate problems
  const problems = useMemo(
    () => [...syntaxProblems, ...runtimeProblems],
    [syntaxProblems, runtimeProblems]
  )

  const handleValidate = useCallback((fileProblems: Problem[]) => {
    setSyntaxProblems(fileProblems)
  }, [])

  // Activity Bar State
  const [activeTool, setActiveTool] = useState<"explorer" | "search" | "settings" | null>("explorer")

  // Handle invalid Scape ID
  if (!id) return <div className="flex h-screen items-center justify-center text-muted-foreground">Invalid API ID</div>

  // Loading State
  if (!scape && !dbFiles) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading Scape...</p>
        </div>
      </div>
    )
  }

  // Scape Not Found
  if (!scape && dbFiles) { // dbFiles loaded but scape not found (deleted?)
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Scape not found</div>
  }

  // Waiting for file selection (or empty project)
  if (!activeFile) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Opening project...</p>
        </div>
      </div>
    )
  }

  // Transform files to tree structure
  const fileTree: FileNode[] = files.map((f) => ({
    id: f.name,
    name: f.name,
    type: "file",
    file: f // CRITICAL: Must pass the file object for the click handler to work
  }))

  return (
    <ScapeLayout
      sidebar={
        <EditorActivityBar
          activeTool={activeTool}
          onToolSelect={setActiveTool}
        />
      }
      headerTitle={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              CodeScape Editor
            </span>
            <span className="text-sm font-medium text-muted-foreground border-l pl-2">
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
          onClick={() => window.location.href = '/dashboard'}
          title="Exit to Dashboard"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit
        </Button>
      }
    >
      <ResizablePanelGroup direction="horizontal">
        {/* Sidebar Panel - Conditionally Rendered */}
        {activeTool === "explorer" && (
          <>
            <ResizablePanel defaultSize={15} minSize={10} maxSize={20} className="bg-muted/10">
              <FileExplorer
                files={fileTree}
                onFileSelect={handleFileSelect}
                activeFileId={activeFile?.name}
              />
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* Main Content */}
        <ResizablePanel defaultSize={85}>
          <div className="flex h-full flex-col">
            {/* Split Editor / Preview */}
            <div className="flex-1 overflow-hidden">
              {/* Simplified View Logic for now */}
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50} minSize={30}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={isTerminalOpen ? 75 : 100}>
                      <CodeEditor
                        key={activeFile.name}
                        fileName={activeFile.name}
                        initialValue={activeFile.content}
                        language={activeFile.language}
                        onChange={handleCodeChange}
                        onValidate={handleValidate}
                      />
                    </ResizablePanel>
                    <ResizableHandle className={!isTerminalOpen ? "hidden" : ""} />
                    {isTerminalOpen && (
                      <ResizablePanel defaultSize={25} minSize={10}>
                        <TerminalPane
                          activeTab={terminalTab}
                          onTabChange={handleTerminalTabChange}
                          onClose={() => setIsTerminalOpen(false)}
                          problems={problems}
                          isCollapsed={false}
                        />
                      </ResizablePanel>
                    )}
                  </ResizablePanelGroup>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={50} minSize={30}>
                  <PreviewPane files={debouncedFiles} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>

            {/* Collapsed Terminal Bar */}
            {!isTerminalOpen && (
              <div className="h-9 border-t bg-background">
                <TerminalPane
                  activeTab={terminalTab}
                  onTabChange={handleTerminalTabChange}
                  problems={problems}
                  isCollapsed={true}
                />
              </div>
            )}

          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ScapeLayout>
  )
}
