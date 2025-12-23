import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  memo,
  useEffect,
  useCallback,
} from "react"
import { MonitorPlay, PanelRightClose, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ScapeFile } from "@/types/file"
import type { ScapeRunnerHandle } from "@/runners/types"
import type { LogEntry } from "@/types/log"

import { usePreviewBridge } from "@/hooks/usePreviewBridge"
import { useSocketBridge } from "@/hooks/useSocketBridge"
import { useStablePreviewPayload } from "@/hooks/useStablePreviewPayload"

interface WebRunnerProps {
  files: ScapeFile[]
  scapeId: string
  onCollapse?: () => void
  onBusyChange?: (isBusy: boolean) => void
  isLive?: boolean
  onOutput?: (log: LogEntry) => void
}

// WebRunner doesn't need to report busy state currently, but we accept the prop
// to match the interface.
export const WebRunner = memo(
  forwardRef<ScapeRunnerHandle, WebRunnerProps>(
    ({ files, scapeId, onCollapse, isLive = false, onOutput }, ref) => {
      const iframeRef = useRef<HTMLIFrameElement>(null)

      // Stable Payload: Batches files + secrets, returns null until ready
      const stablePayload = useStablePreviewPayload(scapeId, files)

      // Manual Refresh Key (for restart button)
      const [refreshKey, setRefreshKey] = useState(0)

      // 0. Socket Bridge
      const { emit: socketEmit, socketId } = useSocketBridge(scapeId, (event, data) => {
        // Forward incoming socket events to Iframe
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "SOCKET_EVENT",
            payload: { event, data },
          },
          "*"
        )
      })

      // Listen for socket emits from Iframe
      useEffect(() => {
        const handler = (e: MessageEvent) => {
          if (e.data?.type === "SOCKET_EMIT") {
            const { event, data } = e.data.payload
            socketEmit(event, data)
          }
        }
        window.addEventListener("message", handler)
        return () => window.removeEventListener("message", handler)
      }, [socketEmit])

      // Inject Virtual Socket Client
      const socketClientCode = `
        export const socket = {
          on: (event, callback) => {
            window.addEventListener('message', (e) => {
              if (e.data?.type === 'SOCKET_EVENT' && e.data?.payload?.event === event) {
                callback(e.data.payload.data);
              }
            });
          },
          emit: (event, data) => {
            window.parent.postMessage({
              type: 'SOCKET_EMIT',
              payload: { event, data }
            }, '*');
          }
        };
        // Global Fallback
        window.CodeScapes = window.CodeScapes || {};
        socket.id = "${socketId}";
        window.CodeScapes.socket = socket;
      `

      // 1. Log Handler (stable callback)
      const handleLog = useCallback(
        (level: string, args: unknown[]) => {
          if (!onOutput) return

          // Format args to string (similar to console.log behavior)
          const content = args
            .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
            .join(" ")

          onOutput({
            id: crypto.randomUUID(),
            type: level === "error" ? "stderr" : "stdout",
            content,
            timestamp: Date.now(),
          })
        },
        [onOutput]
      )

      // --- EARLY RETURN: Wait for stable payload ---
      // This is critical: usePreviewBridge should NOT be called until payload is ready.
      // But hooks must be called unconditionally. So we call it, but with empty files.
      // Actually, we need to restructure. Let's use a conditional render approach.

      // Build files with socket injection (only if payload ready)
      const filesWithSocket = stablePayload
        ? [
            ...stablePayload.files,
            {
              name: "socket.js",
              content: socketClientCode,
              language: "javascript",
            } as ScapeFile,
          ]
        : []

      // Bridge to the Runtime (only active when payload is ready)
      const bridge = usePreviewBridge(
        filesWithSocket,
        scapeId,
        socketId,
        iframeRef,
        stablePayload?.env ?? {},
        refreshKey,
        handleLog
      )

      useImperativeHandle(ref, () => ({
        captureThumbnail: async () => {
          const iframe = iframeRef.current
          if (!iframe || !iframe.contentWindow) return null

          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              window.removeEventListener("message", handler)
              console.warn("[WebRunner] Thumbnail capture timeout")
              resolve(null)
            }, 5000)

            const handler = (e: MessageEvent) => {
              if (e.data?.type === "SANDBOX_THUMBNAIL_DATA") {
                clearTimeout(timeout)
                window.removeEventListener("message", handler)
                console.log("[WebRunner] Thumbnail received")
                resolve(e.data.payload || null)
              }
            }

            window.addEventListener("message", handler)
            iframe.contentWindow!.postMessage({ type: "SANDBOX_CAPTURE_THUMBNAIL" }, "*")
          })
        },
        restart: async () => {
          setRefreshKey((prev) => prev + 1)
        },
        installPackage: async () => ({
          success: false,
          error: "Not supported in Web environment",
        }),
      }))

      // --- EARLY RETURN: Wait for stable payload ---
      // Critical: Do NOT render the iframe until payload is ready.
      // This prevents the bridge from sending COMPILE_FILES with 0 files.
      if (!stablePayload || !files.length) {
        return (
          <div className="flex h-full flex-col border-l border-border bg-background dark:border-zinc-800">
            <div className="flex h-10 items-center justify-between border-b border-border bg-muted/20 px-2 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MonitorPlay className="h-3.5 w-3.5" />
                <span>Preview (Web)</span>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </div>
        )
      }

      // Live Mode: No Chrome
      if (isLive) {
        return (
          <div className="relative h-full w-full bg-white">
            {/* Loading Overlay */}
            {(!bridge.ready || !bridge.contentReady) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
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
            {(!bridge.ready || !bridge.contentReady) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
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
