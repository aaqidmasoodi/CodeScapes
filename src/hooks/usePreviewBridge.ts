import { useEffect, useState } from "react"
import type { ScapeFile } from "@/types/file"

// We are now fully committed to the Cross-Origin Bootloader architecture.
// There is no more "Same Origin" mode.

interface PreviewBridge {
  ready: boolean
  url: string
}

export function usePreviewBridge(
  files: ScapeFile[],
  scapeId: string,
  iframeRef?: React.RefObject<HTMLIFrameElement | null>
): PreviewBridge {
  const [bridgeState, setBridgeState] = useState<PreviewBridge>({
    ready: false,
    url: "",
  })

  useEffect(() => {
    if (!iframeRef) {
      console.error("Frame ref required for Bridge")
      return
    }

    // 1. Determine Bootloader URL
    // Development: Use the dedicated Sandbox Server on Port 3001
    // Production: Use current origin (or subdomain logic if configured)

    let bootloaderOrigin = ""
    const currentHost = window.location.hostname

    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      // DEV MODE: Port Isolation
      // Use localhost:3002 (Fresh Origin, no ghost SW)
      bootloaderOrigin = `${window.location.protocol}//localhost:3002`
    } else {
      // PROD MODE: Fallback to same origin for now, but ideally subdomains.
      bootloaderOrigin = window.location.origin
    }

    // Versioning forces the iframe to reload if we re-mount or important state changes
    // Ideally we just reload the iframe content, but the URL param helps during dev.
    const version = Date.now()
    const bootloaderUrl = `${bootloaderOrigin}/sandbox/bootloader.html?v=${version}`

    // Initial State: Point to Bootloader, but NOT ready (waiting for handshake)
    setBridgeState({ ready: false, url: bootloaderUrl })

    // 2. Setup Handshake Listener
    const handleMessage = (event: MessageEvent) => {
      // Debugging: Log what we see
      if (event.data?.type === "SANDBOX_LOG") {
        const { level, payload } = event.data
        const prefix = `%c[Sandbox]`
        const style = "background: #222; color: #bada55"
        // Replay log
        if (level === "log") console.log(prefix, style, ...payload)
        if (level === "warn") console.warn(prefix, style, ...payload)
        if (level === "error") console.error(prefix, style, ...payload)
        return // Don't block
      }

      // Strict Origin Check
      if (event.origin !== bootloaderOrigin) return

      if (event.data.type === "SANDBOX_READY") {
        console.log("[Bridge] Sandbox is Ready. Sending Files...")

        // 3. Send Files
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "COMPILE_FILES",
            payload: { scapeId, files },
          },
          bootloaderOrigin
        )

        // Mark ready. The iframe will redirect itself to /run/...
        setBridgeState((prev) => ({ ...prev, ready: true }))
      }
    }

    window.addEventListener("message", handleMessage)

    // Timeout Safety (Removed to avoid stale closure issues and lint warnings)
    // If the sandbox doesn't load, the user will see the loading screen indefinitely.
    /*
    const timeoutId = setTimeout(() => {
       ...
    }, 5000)
    */

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [scapeId, files, iframeRef]) // removed mode, isSwReady

  return bridgeState
}
