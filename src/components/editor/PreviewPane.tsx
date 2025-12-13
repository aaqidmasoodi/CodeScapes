import { MonitorPlay, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"

interface PreviewPaneProps {
  files: ScapeFile[]
}

export function PreviewPane({ files }: PreviewPaneProps) {
  const htmlFile = files.find((f) => f.name === "index.html")
  const rawHtml = htmlFile?.content || ""

  // Process the HTML to inject resources
  let processedHtml = rawHtml

  // 1. Inject Import Map (Keep existing logic)
  const importMapScript = `
    <script type="importmap">
      {
        "imports": {
          "three": "https://esm.sh/three@0.160.0",
          "three/": "https://esm.sh/three@0.160.0/"
        }
      }
    </script>
    <script>
      window.onerror = function(message, source, lineno, colno, error) { 
        // Display in preview for visual feedback
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: red; padding: 10px; border-top: 1px solid #ccc; background: white; font-family: monospace; font-size: 12px;';
        errorDiv.textContent = 'Runtime Error: ' + message;
        document.body.appendChild(errorDiv);

        // Send to parent
        window.parent.postMessage({
          type: 'RUNTIME_ERROR',
          error: {
            message: message,
            line: lineno,
            column: colno
          }
        }, '*');
      };
    </script>
  `

  if (processedHtml.includes("<head>")) {
    processedHtml = processedHtml.replace("<head>", "<head>" + importMapScript)
  } else {
    processedHtml = importMapScript + processedHtml
  }

  // 2. Dynamic Resource Injection
  // We iterate through the HTML finding script/link tags and replacing them with inline content
  // if a matching file exists in our file list.

  // Inject CSS
  // Regex looks for <link rel="stylesheet" href="...">
  processedHtml = processedHtml.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    const file = files.find(f => f.name === href || f.name === href.replace(/^\.\//, ''))
    if (file && file.language === 'css') {
      return `<style>${file.content}</style>`
    }
    return match // Keep external links or missing files as is
  })

  // Inject JS
  // Regex looks for <script src="...">
  processedHtml = processedHtml.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
    // Check if it's an external URL (http/https/cdn) - skip those
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return match
    }

    const file = files.find(f => f.name === src || f.name === src.replace(/^\.\//, ''))
    if (file) {
      // Check if module is needed based on content
      const needsModule = file.content.includes('import ') || file.content.includes('export ')
      // If original tag had type="module", preserve it? 
      // Actually, safer to force our detection or preserve original attribute if present.
      // Simplified: just inject content.

      // preserve existing type if in match?
      const isModuleRequest = match.includes('type="module"')
      const finalType = isModuleRequest || needsModule ? 'type="module"' : ''

      return `<script ${finalType}>${file.content}</script>`
    }
    return match
  })

  // If the user cleared everything, just show the content
  if (!processedHtml) processedHtml = '<div style="padding:20px">No index.html content</div>'

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 border-l dark:border-zinc-800">
      <div className="flex h-10 items-center justify-between border-b bg-muted/20 dark:bg-zinc-900/50 px-2 border-zinc-200 dark:border-zinc-800">
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
          srcDoc={processedHtml}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}
