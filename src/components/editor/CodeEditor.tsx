import Editor, { type OnMount, type OnValidate, useMonaco } from "@monaco-editor/react"
import { useTheme } from "@/components/theme-provider"
import type { Problem } from "@/types/problem"
import type { ScapeFile } from "@/types/file"
import { useEffect, useRef } from "react"
import { LoadingOverlay } from "@/components/ui/spinner"

interface CodeEditorProps {
  initialValue?: string
  language?: string
  fileName?: string
  onChange?: (value: string | undefined) => void
  onValidate?: (problems: Problem[]) => void
  files?: ScapeFile[] // All files for IntelliSense
  onRun?: () => void
}

export function CodeEditor({
  initialValue = "// Start coding here...",
  language = "javascript",
  fileName = "unknown",
  onChange,
  onValidate,
  files = [],
  onRun,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const monaco = useMonaco()
  const onRunRef = useRef(onRun)

  useEffect(() => {
    onRunRef.current = onRun
  }, [onRun])

  // Configure IntelliSense for multi-file support
  useEffect(() => {
    if (!monaco || !files.length) return

    // Filter for JS files that are NOT the current file
    // We treat them as global functionality (common in p5.js / simple setups)
    const extraLibs = files
      .filter((f) => f.name.endsWith(".js") && f.name !== fileName)
      .map((f) => ({
        content: f.content,
        // Using a definition path or just the filename
        filePath: `file:///${f.name}`,
      }))

    // Setup Compiler Options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tsDefaults = (monaco.languages.typescript as any).javascriptDefaults

    tsDefaults.setCompilerOptions({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target: (monaco.languages.typescript as any).ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: true,
      noLib: false,
    })

    // Dispose old libs before adding new ones
    const disposables = extraLibs.map((lib) => tsDefaults.addExtraLib(lib.content, lib.filePath))

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      disposables.forEach((d: any) => d.dispose())
    }
  }, [monaco, files, fileName])

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Basic configuration
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      wordWrap: "on",
      padding: { top: 16 },
      scrollBeyondLastLine: false,
    })

    // Command Bindings
    // Run (Cmd+Enter)
    if (onRun) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        onRunRef.current?.()
      })
    }

    // Save (Cmd+S) - Trigger Format
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction("editor.action.formatDocument")?.run()
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

  // Resolve effective theme for Monaco
  const effectiveTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "vs-dark"
        : "light"
      : theme === "dark"
        ? "vs-dark"
        : "light"

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={initialValue}
        theme={effectiveTheme}
        loading={<LoadingOverlay message="Initializing Editor..." />}
        onMount={handleEditorDidMount}
        onChange={onChange}
        onValidate={(markers) => {
          try {
            handleValidate(markers)
          } catch {
            // Suppress cancellation errors
          }
        }}
        options={{
          automaticLayout: true,
        }}
      />
    </div>
  )
}
