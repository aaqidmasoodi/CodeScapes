import Editor, { type OnMount, type OnValidate, useMonaco } from "@monaco-editor/react"
import { emmetHTML, emmetCSS } from "emmet-monaco-es"
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

    // Only configure TS defaults if we are in a JS/TS environment to avoid overhead
    // or potential conflicts (though monaco handles this globally).
    // The main issue was CSVs being treated as JS. Now that we have proper language detection,
    // this is safer, but let's be explicit.
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

    // Dispose any previous emmet instance (if any)
    // Monaco-emmet-es doesn't have a clean dispose method exposed easily on the global instance
    // but re-registering usually overwrites.
    // However, we should be careful.
    if (language === "html" || language === "php") {
      emmetHTML(monaco)
    } else if (language === "css" || language === "scss" || language === "less") {
      emmetCSS(monaco)
    } else if (language === "javascript" || language === "typescript") {
      // JSX / TSX Emmet support
      if (fileName.endsWith(".jsx") || fileName.endsWith(".tsx")) {
        emmetHTML(monaco)
      }
    }

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
        // Controlled value for Real-time Sync
        value={initialValue}
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
          // Prevent cursor jumping if possible (Monaco handles this relatively well)
        }}
      />
    </div>
  )
}
