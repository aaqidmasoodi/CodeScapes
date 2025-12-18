import { useState, useRef, forwardRef, useImperativeHandle, memo } from "react"
import { MonitorPlay, PanelRightClose } from "lucide-react"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import type { ScapeRunnerHandle } from "@/runners/types"

import { useServiceWorkerFS } from "@/hooks/useServiceWorkerFS"

interface WebRunnerProps {
  files: ScapeFile[]
  scapeId: string
  onCollapse?: () => void
  onBusyChange?: (isBusy: boolean) => void
}

// WebRunner doesn't need to report busy state currently, but we accept the prop
// to match the interface.
export const WebRunner = memo(
  forwardRef<ScapeRunnerHandle, WebRunnerProps>(({ files, scapeId, onCollapse }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    // Sync files to Service Worker (Namespaced)
    const isServiceWorkerReady = useServiceWorkerFS(files, scapeId)

    const [refreshKey, setRefreshKey] = useState(0)

    useImperativeHandle(ref, () => ({
      captureThumbnail: async () => {
        const iframe = iframeRef.current
        if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return null

        try {
          // Keep it simple for now as html2canvas might struggle with cross-origin in SW mode?
          // Actually SW is same-origin, so it might be EASIER!
          // But for now, let's just try basic canvas capture if present.
          const canvasEl = iframe.contentDocument.querySelector("canvas")
          if (canvasEl) {
            return canvasEl.toDataURL("image/jpeg", 0.7)
          }
          // Fallback to html2canvas
          const canvas = await html2canvas(iframe.contentDocument.body, {
            useCORS: true,
            logging: false,
            ignoreElements: (element) => element.tagName === "SCRIPT" || element.tagName === "LINK",
          })
          return canvas.toDataURL("image/jpeg", 0.7)
        } catch (e) {
          console.error("Thumbnail capture failed", e)
          return null
        }
      },
      restart: async () => {
        setRefreshKey((prev) => prev + 1)
      },
      installPackage: async () => ({ success: false, error: "Not supported in Web environment" }),
    }))

    // Determine entry point
    const entryFile = files.find((f) => f.name === "index.html") ? "index.html" : files[0]?.name

    // If no files, empty
    if (!files.length) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No files
        </div>
      )
    }

    if (!isServiceWorkerReady) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-zinc-400">
          Initializing Environment...
        </div>
      )
    }
    return (
      <div className="flex h-full flex-col border-l border-border bg-background dark:border-zinc-800">
        <div className="flex h-10 items-center justify-between border-b border-border bg-muted/20 px-2 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MonitorPlay className="h-3.5 w-3.5" />
            <span className="max-w-[200px] truncate">Preview (Web)</span>
          </div>

          <div className="flex items-center gap-3">
            {onCollapse && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={onCollapse}
                title="Collapse Preview"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="relative flex-1 bg-white">
          <iframe
            key={refreshKey}
            ref={iframeRef}
            title="preview"
            // Point to the virtual NAMESPACED path intercepted by SW
            src={`/preview-v3/${scapeId}/${entryFile}`}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
          />
        </div>
      </div>
    )
  })
)

WebRunner.displayName = "WebRunner"
