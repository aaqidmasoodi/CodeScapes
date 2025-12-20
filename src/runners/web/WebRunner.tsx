import { useState, useRef, forwardRef, useImperativeHandle, memo, useEffect } from "react"
import { MonitorPlay, PanelRightClose } from "lucide-react"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import type { ScapeRunnerHandle } from "@/runners/types"

import { usePreviewBridge } from "@/hooks/usePreviewBridge"
import { secretsService } from "@/services/secrets"

interface WebRunnerProps {
  files: ScapeFile[]
  scapeId: string
  onCollapse?: () => void
  onBusyChange?: (isBusy: boolean) => void
  isLive?: boolean
}

// WebRunner doesn't need to report busy state currently, but we accept the prop
// to match the interface.
export const WebRunner = memo(
  forwardRef<ScapeRunnerHandle, WebRunnerProps>(
    ({ files, scapeId, onCollapse, isLive = false }, ref) => {
      const iframeRef = useRef<HTMLIFrameElement>(null)
      const [envVars, setEnvVars] = useState<Record<string, string>>({})

      // Fetch Secrets
      const [refreshKey, setRefreshKey] = useState(0)

      useEffect(() => {
        if (!scapeId) return
        secretsService.getSecrets(scapeId).then((secrets) => {
          const map: Record<string, string> = {}
          secrets.forEach((s) => (map[s.key] = s.value))
          setEnvVars(map)
          // Force refresh to inject secrets
          setRefreshKey((k) => k + 1)
        })
      }, [scapeId])

      // Bridge to the Runtime
      // Phase 4: Activated Cross-Origin Mode (Dedicated)
      const bridge = usePreviewBridge(files, scapeId, iframeRef, envVars, refreshKey)

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
              ignoreElements: (element) =>
                element.tagName === "SCRIPT" || element.tagName === "LINK",
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
        installPackage: async () => ({
          success: false,
          error: "Not supported in Web environment",
        }),
      }))

      // If no files, empty
      if (!files.length) {
        return (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No files
          </div>
        )
      }

      // Live Mode: No Chrome
      if (isLive) {
        return (
          <div className="relative h-full w-full bg-white">
            {/* Loading Overlay */}
            {!bridge.ready && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white text-sm text-zinc-400">
                Initializing Environment...
              </div>
            )}
            <iframe
              key={refreshKey}
              ref={iframeRef}
              title="preview-live"
              src={bridge.url}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
              allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; xr-spatial-tracking"
            />
          </div>
        )
      }

      // Dev Mode: Full Chrome
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
            {/* Loading Overlay */}
            {!bridge.ready && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white text-sm text-zinc-400">
                <p>Initializing Environment...</p>
              </div>
            )}

            <iframe
              key={refreshKey}
              ref={iframeRef}
              title="preview"
              // Point to the virtual NAMESPACED path intercepted by SW
              src={bridge.url}
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
              allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; xr-spatial-tracking"
            />
          </div>
        </div>
      )
    }
  )
)

WebRunner.displayName = "WebRunner"
