import { useState, useLayoutEffect } from "react"
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
  iframeRef?: React.RefObject<HTMLIFrameElement | null>,
  env?: Record<string, string>,
  versionKey?: number
): PreviewBridge {
  // State for tracking reset
  const [prevVersionKey, setPrevVersionKey] = useState(versionKey)
  const [prevFiles, setPrevFiles] = useState(files)

  // Initialize state with correct URL
  const [bridgeState, setBridgeState] = useState<PreviewBridge>(() => {
    let bootloaderOrigin = ""
    const currentHost = window.location.hostname
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      bootloaderOrigin = `${window.location.protocol}//localhost:3002`
    } else {
      bootloaderOrigin = window.location.origin
    }
    const version = versionKey || Date.now()
    return {
      ready: false,
      url: `${bootloaderOrigin}/sandbox/bootloader.html?v=${version}`,
    }
  })

  // Render-time state derivation (Correct Pattern for Prop Driven Resets)
  if (versionKey !== prevVersionKey || files !== prevFiles) {
    setPrevVersionKey(versionKey)
    setPrevFiles(files)

    // Determine URL immediately for the new version
    let bootloaderOrigin = ""
    const currentHost = window.location.hostname
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      bootloaderOrigin = `${window.location.protocol}//localhost:3002`
    } else {
      bootloaderOrigin = window.location.origin
    }
    // eslint-disable-next-line react-hooks/purity
    const version = versionKey || Date.now()
    // Add file hash param to force reload even if versionKey is same
    // eslint-disable-next-line react-hooks/purity
    const fileHash = Date.now()
    const bootloaderUrl = `${bootloaderOrigin}/sandbox/bootloader.html?v=${version}&h=${fileHash}`

    // Reset state immediately

    setBridgeState({ ready: false, url: bootloaderUrl })
  }

  // useLayoutEffect ensures the listener is attached BEFORE the iframe has a chance
  // to load and fire its message, guarding against race conditions.
  useLayoutEffect(() => {
    if (!iframeRef) {
      console.error("Frame ref required for Bridge")
      return
    }

    // 1. Determine Bootloader Origin
    let bootloaderOrigin = ""
    const currentHost = window.location.hostname

    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      bootloaderOrigin = `${window.location.protocol}//localhost:3002`
    } else {
      bootloaderOrigin = window.location.origin
    }

    // 2. Setup Handshake Listener
    const handleMessage = (event: MessageEvent) => {
      // Filter irrelevant logs
      if (event.data?.type === "SANDBOX_LOG") {
        const { level, payload } = event.data
        const prefix = `%c[Sandbox]`
        const style = "background: #222; color: #bada55"
        if (level === "log") console.log(prefix, style, ...payload)
        if (level === "warn") console.warn(prefix, style, ...payload)
        if (level === "error") console.error(prefix, style, ...payload)
        return
      }

      if (event.origin !== bootloaderOrigin) return

      if (event.data.type === "SANDBOX_READY") {
        console.log("[Bridge] Handshake Received! Sending Compile Payload...")

        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "COMPILE_FILES",
            payload: { scapeId, files, env },
          },
          bootloaderOrigin
        )

        setBridgeState((prev) => ({ ...prev, ready: true }))
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [scapeId, files, iframeRef, env, versionKey])

  return bridgeState
}
