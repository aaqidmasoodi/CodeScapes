import { useState, useEffect } from "react"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import Editor from "@monaco-editor/react"
import { type ScapeFile } from "@/types/file"
import { useTheme } from "@/components/theme-provider"

const repo = new CloudRepository()

export function CodeViewer({ scapeId }: { scapeId: string }) {
  const { resolvedTheme } = useTheme()
  const [files, setFiles] = useState<ScapeFile[]>([])
  const [activeFile, setActiveFile] = useState<ScapeFile | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await repo.getFiles(scapeId)
        // Filter: Exclude assets folder and binary files, keep only code
        const filtered = data.filter(
          (f) =>
            !f.name.startsWith("assets/") &&
            !f.name.match(/\.(png|jpg|jpeg|gif|webp|ico|svg)$/i) &&
            f.name.match(/\.(html|css|js|jsx|ts|tsx|json|py)$/i)
        )
        setFiles(filtered)
        if (filtered.length > 0) setActiveFile(filtered[0])
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [scapeId])

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Tabs */}
      <div className="no-scrollbar flex min-h-[35px] w-full overflow-x-auto border-b bg-muted/40">
        {files.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFile(f)}
            className={`whitespace-nowrap border-r px-4 py-2 text-xs transition-colors hover:bg-muted ${
              activeFile?.id === f.id
                ? "bg-background font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {f.name}
          </button>
        ))}
        {files.length === 0 && (
          <div className="px-4 py-2 text-xs text-muted-foreground">No files</div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden bg-background">
        {activeFile ? (
          <Editor
            height="100%"
            language={activeFile.language}
            value={typeof activeFile.content === "string" ? activeFile.content : "Binary Content"}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              padding: { top: 16, bottom: 16 },
              domReadOnly: true,
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            {files.length > 0 ? "Select a file" : "No files to display"}
          </div>
        )}
      </div>
    </div>
  )
}
