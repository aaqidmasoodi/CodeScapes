import { MonitorPlay, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"

interface PreviewPaneProps {
  files: ScapeFile[]
}

export function PreviewPane({ files }: PreviewPaneProps) {
  // Extract content
  const htmlFile = files.find((f) => f.name === "index.html")
  const cssFile = files.find((f) => f.name === "style.css")
  const jsFile = files.find((f) => f.name === "app.js")

  const rawHtml = htmlFile?.content || ""
  const cssContent = cssFile?.content || ""
  const jsContent = jsFile?.content || ""

  // Process the HTML to inject resources
  let processedHtml = rawHtml

  // 1. Inject Import Map (Environment setup - always inject if parsing succeeds, mostly invisible helper)
  // We keep this to ensure 'three' works without npm install, which is a platform feature.
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

  // 2. Strict CSS Injection
  // Only inject if the link tag exists
  const styleTag = `<style>body { margin: 0; } ${cssContent}</style>`
  const cssLinkRegex = /<link[^>]*href=["']style\.css["'][^>]*>/i

  if (cssLinkRegex.test(processedHtml)) {
    processedHtml = processedHtml.replace(cssLinkRegex, styleTag)
  }
  // Else: User removed the link, so we interpret that as "no styles wanted" from that file.

  // 3. Strict JS Injection
  // Only inject if the script tag exists
  const scriptTag = `<script type="module">${jsContent}</script>`
  const jsScriptRegex = /<script[^>]*src=["']app\.js["'][^>]*><\/script>/i

  if (jsScriptRegex.test(processedHtml)) {
    processedHtml = processedHtml.replace(jsScriptRegex, scriptTag)
  }
  // Else: User removed the script, so we don't run it.

  // If the user cleared everything, just show the content
  if (!processedHtml) processedHtml = '<div style="padding:20px">No index.html content</div>'

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-10 items-center justify-between border-b bg-muted/20 px-2">
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
