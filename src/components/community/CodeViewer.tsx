import { useState, useEffect } from "react"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import Editor from "@monaco-editor/react"
import { type ScapeFile } from "@/types/file"

const repo = new CloudRepository()

export function CodeViewer({ scapeId }: { scapeId: string }) {
    const [files, setFiles] = useState<ScapeFile[]>([])
    const [activeFile, setActiveFile] = useState<ScapeFile | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const data = await repo.getFiles(scapeId)
                // Filter: Exclude assets folder and binary files, keep only code
                const filtered = data.filter(f =>
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
            <div className="flex min-h-[35px] w-full border-b bg-muted/40 overflow-x-auto">
                {files.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFile(f)}
                        className={`border-r px-4 py-2 text-xs transition-colors hover:bg-muted whitespace-nowrap ${activeFile?.id === f.id ? "bg-background font-medium text-foreground" : "text-muted-foreground"
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
            <div className="flex-1 relative bg-background overflow-hidden">
                {activeFile ? (
                    <Editor
                        height="100%"
                        language={activeFile.language}
                        value={typeof activeFile.content === 'string' ? activeFile.content : "Binary Content"}
                        theme="vs-dark"
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
                        {files.length > 0 ? 'Select a file' : 'No files to display'}
                    </div>
                )}

            </div>
        </div>
    )
}
