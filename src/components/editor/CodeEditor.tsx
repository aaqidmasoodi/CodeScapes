import Editor, { type OnMount, type OnValidate } from "@monaco-editor/react"
import { useTheme } from "@/components/theme-provider"
import type { Problem } from "@/types/problem"

interface CodeEditorProps {
  initialValue?: string
  language?: string
  fileName?: string
  onChange?: (value: string | undefined) => void
  onValidate?: (problems: Problem[]) => void
}

export function CodeEditor({
  initialValue = "// Start coding here...",
  language = "javascript",
  fileName = "unknown",
  onChange,
  onValidate,
}: CodeEditorProps) {
  const { theme } = useTheme()

  const handleEditorDidMount: OnMount = (editor) => {
    // Basic configuration
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: "on",
      padding: { top: 16 },
      scrollBeyondLastLine: false,
    })
  }

  const handleValidate: OnValidate = (markers) => {
    if (!onValidate) return

    const problems: Problem[] = markers.map((marker) => ({
      id: `${fileName}-${marker.startLineNumber}-${marker.startColumn}`,
      file: fileName,
      message: marker.message,
      line: marker.startLineNumber,
      column: marker.startColumn,
      severity: marker.severity === 8 ? "error" : "warning", // 8 is MarkerSeverity.Error
      source: "syntax",
    }))

    onValidate(problems)
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={initialValue}
        theme={theme === "dark" ? "vs-dark" : "light"}
        onMount={handleEditorDidMount}
        onChange={onChange}
        onValidate={handleValidate}
        options={{
          automaticLayout: true,
        }}
      />
    </div>
  )
}
