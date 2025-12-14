import { useEffect, useState, useMemo } from "react"
import { MonitorPlay, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"

interface PreviewPaneProps {
  files: ScapeFile[]
}

export function PreviewPane({ files }: PreviewPaneProps) {
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({})

  // 1. Create Blob URLs for all files
  // We strip './' from imports in JS files to force them to be "bare modules"
  // This bypasses the "Invalid relative url" error in Blob/SrcDoc environments
  useEffect(() => {
    const newUrls: Record<string, string> = {}

    files.forEach((file) => {
      let content = file.content
      let type = "text/javascript"

      if (file.name.endsWith(".js")) {
        // Rewrite relative imports to bare imports
        // e.g. import { x } from './scene.js' -> import { x } from 'scene.js'
        content = content.replace(/from\s+['"]\.\/([^'"]+)['"]/g, "from '$1'")
        // Also handle import './style.css' ?
        // Usually side-effect imports: import './interaction.js'
        content = content.replace(/import\s+['"]\.\/([^'"]+)['"]/g, "import '$1'")
      }

      if (file.name.endsWith(".css")) type = "text/css"
      if (file.name.endsWith(".html")) type = "text/html"

      const blob = new Blob([content], { type })
      newUrls[file.name] = URL.createObjectURL(blob)
    })

    setBlobUrls(newUrls)

    return () => {
      Object.values(newUrls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  // 2. Construct the HTML (using srcDoc for simplicity/stability)
  const srcDoc = useMemo(() => {
    const htmlFile = files.find((f) => f.name === "index.html")
    if (!htmlFile) {
      return '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#666;">No index.html found</div>'
    }

    // Build Import Map
    const imports: Record<string, string> = {
      "three": "https://esm.sh/three@0.160.0",
      "three/": "https://esm.sh/three@0.160.0/"
    }

    // Map bare filenames to Blob URLs
    Object.entries(blobUrls).forEach(([name, url]) => {
      if (name.endsWith(".js")) {
        imports[name] = url
      }
    })

    const importMap = { imports }

    let processedHtml = htmlFile.content

    // Inject Import Map
    const importMapScript = `
      <script type="importmap">
        ${JSON.stringify(importMap, null, 2)}
      </script>
      <script>
        window.onerror = function(message, source, lineno, colno, error) { 
          window.parent.postMessage({
            type: 'RUNTIME_ERROR',
            payload: { message: message, line: lineno, column: colno }
          }, '*');
        };
      </script>
    `

    if (processedHtml.includes("<head>")) {
      processedHtml = processedHtml.replace("<head>", "<head>" + importMapScript)
    } else {
      processedHtml = importMapScript + processedHtml
    }

    // Inject CSS Link Replacements
    processedHtml = processedHtml.replace(
      /<link[^>]*href=["']([^"']+)["'][^>]*>/gi,
      (match, href) => {
        const cleanName = href.replace(/^\.\//, "")
        if (blobUrls[cleanName] && cleanName.endsWith(".css")) {
          return `<link rel="stylesheet" href="${blobUrls[cleanName]}">`
        }
        return match
      }
    )

    // Inject JS Script Replacements
    processedHtml = processedHtml.replace(
      /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
      (match, src) => {
        const cleanName = src.replace(/^\.\//, "")
        if (blobUrls[cleanName] && cleanName.endsWith(".js")) {
          // Replace with bare import if we want, OR just direct Blob URL source associated with the file
          // Since it's a top-level script tag, we can use the Blob URL directly
          return match.replace(src, blobUrls[cleanName])
        }
        return match
      }
    )

    return processedHtml
  }, [files, blobUrls])

  return (
    <div className="flex h-full flex-col border-l bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-10 items-center justify-between border-b border-zinc-200 bg-muted/20 px-2 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MonitorPlay className="h-3.5 w-3.5" />
          <span className="max-w-[200px] truncate">Preview</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          title="preview"
          srcDoc={srcDoc}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
        />
      </div>
    </div>
  )
}
