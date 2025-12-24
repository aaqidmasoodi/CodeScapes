import { useState, useLayoutEffect, useMemo, useRef, useEffect } from "react"
import type { ScapeFile } from "@/types/file"
import { debug } from "@/lib/debug"

// We are now fully committed to the Cross-Origin Bootloader architecture.
// There is no more "Same Origin" mode.

interface PreviewBridge {
  ready: boolean
  contentReady: boolean
  url: string
}

// Helper for simple deterministic hash
const computeHash = (str: string) => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString(36)
}

export function usePreviewBridge(
  files: ScapeFile[],
  scapeId: string,
  socketId: string,
  iframeRef?: React.RefObject<HTMLIFrameElement | null>,
  env?: Record<string, string>,
  versionKey?: number,
  onLog?: (level: string, args: unknown[]) => void
): PreviewBridge {
  const filesHash = useMemo(() => {
    return files
      .map((f) => {
        let size = 0
        let preview = ""
        if (typeof f.content === "string") {
          size = f.content.length
          preview = f.content.slice(0, 20)
        } else if (f.content instanceof Blob) {
          size = f.content.size
          preview = "blob"
        } else if (f.content instanceof Uint8Array || f.content instanceof ArrayBuffer) {
          size = f.content.byteLength
          preview = "bin"
        }
        return `${f.name}:${size}:${preview}`
      })
      .sort()
      .join("|")
  }, [files])

  const [prevVersionKey, setPrevVersionKey] = useState(versionKey)
  const [prevFilesHash, setPrevFilesHash] = useState(filesHash)

  const [bridgeState, setBridgeState] = useState<PreviewBridge>(() => {
    let bootloaderUrl = ""
    const currentHost = window.location.hostname
    const version = versionKey || Date.now()
    const hash = computeHash(filesHash)
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      bootloaderUrl = `${window.location.protocol}//localhost:3002/sandbox/bootloader.html?v=${version}&h=${hash}`
    } else {
      bootloaderUrl = `https://sandbox.codescapes.io/bootloader.html?v=${version}&h=${hash}`
    }
    return {
      ready: false,
      contentReady: false,
      url: bootloaderUrl,
    }
  })

  // Render-time state derivation
  if (versionKey !== prevVersionKey) {
    // Check for Soft Reload
    if (env?.hotUpdate === "true" && bridgeState.ready) {
      setPrevVersionKey(versionKey)
      // DO NOT show spinner for soft reload - keep content visible for instant experience
    } else {
      // Hard Reload
      setPrevVersionKey(versionKey)
      setPrevFilesHash(filesHash)

      let bootloaderUrl = ""
      const currentHost = window.location.hostname
      const version = versionKey ?? 0
      const hash = computeHash(filesHash)
      if (currentHost === "localhost" || currentHost === "127.0.0.1") {
        bootloaderUrl = `${window.location.protocol}//localhost:3002/sandbox/bootloader.html?v=${version}&h=${hash}`
      } else {
        bootloaderUrl = `https://sandbox.codescapes.io/bootloader.html?v=${version}&h=${hash}`
      }

      setBridgeState({ ready: false, contentReady: false, url: bootloaderUrl })
    }
  } else if (filesHash !== prevFilesHash && env?.hotUpdate === "true" && bridgeState.ready) {
    setPrevFilesHash(filesHash)
    // DO NOT show spinner for hot swap - keep content visible for instant experience
  }

  // --- REFS for Stable Callbacks ---
  // These allow the effect to access the latest values without re-running.
  const filesRef = useRef(files)
  const envRef = useRef(env)
  const onLogRef = useRef(onLog)

  // Keep refs updated (in effect to comply with React rules)
  useEffect(() => {
    filesRef.current = files
    envRef.current = env
    onLogRef.current = onLog
  })

  // useLayoutEffect ensures the listener is attached BEFORE the iframe has a chance
  // to load and fire its message, guarding against race conditions.
  // CRITICAL: This effect ONLY runs once per scapeId to prevent listener thrashing.
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
      bootloaderOrigin = `https://sandbox.codescapes.io`
    }

    // 2. Setup Handshake Listener
    const handleMessage = (event: MessageEvent) => {
      // Filter irrelevant logs
      if (event.data?.type === "SANDBOX_LOG") {
        const { level, payload } = event.data

        // Notify Parent (Runner) - using ref for latest callback
        onLogRef.current?.(level, payload)

        const prefix = `%c[Sandbox]`
        const style = "background: #222; color: #bada55"
        if (level === "log") console.log(prefix, style, ...payload)
        if (level === "warn") console.warn(prefix, style, ...payload)
        if (level === "error") console.error(prefix, style, ...payload)
        return
      }

      // Handle Content Ready Signal (from App/Iframe)
      if (event.data?.type === "SANDBOX_CONTENT_READY") {
        setBridgeState((prev) => ({ ...prev, contentReady: true }))
        return
      }

      if (event.origin !== bootloaderOrigin) return

      if (event.data.type === "SANDBOX_READY") {
        // Only send compile if we actually have files
        if (filesRef.current.length === 0) {
          debug.log("[Bridge] Handshake received, but no files yet. Skipping compile.")
          return
        }

        debug.log("[Bridge] Handshake Received! Sending Compile Payload...")

        // Use refs for latest files/env
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "COMPILE_FILES",
            payload: { scapeId, socketId, files: filesRef.current, env: envRef.current },
          },
          bootloaderOrigin
        )

        setBridgeState((prev) => ({ ...prev, ready: true }))
      }
    }

    window.addEventListener("message", handleMessage)

    // Safety Timeout: Force ready if signal missed (e.g. fatal error in user code prevents load)
    // This prevents the "Loading..." spinner from getting stuck forever.
    const safetyTimeout = setTimeout(() => {
      setBridgeState((prev) => {
        if (!prev.contentReady && prev.ready) {
          debug.warn("[Bridge] Content Ready Signal missing, forcing ready.")
          return { ...prev, contentReady: true }
        }
        return prev
      })
    }, 2000)

    return () => {
      window.removeEventListener("message", handleMessage)
      clearTimeout(safetyTimeout)
    }
  }, [scapeId, iframeRef]) // MINIMAL DEPS - Only scapeId and iframeRef

  // Revised Hot Update Effect using Ref for stability check
  const lastSentHash = useRef<string>(filesHash)
  const lastSentVersion = useRef<number | undefined>(versionKey)

  useLayoutEffect(() => {
    if (envRef.current?.hotUpdate === "true" && bridgeState.ready && iframeRef?.current) {
      if (lastSentHash.current !== filesHash || lastSentVersion.current !== versionKey) {
        lastSentHash.current = filesHash
        lastSentVersion.current = versionKey

        // Determine Origin
        let bootloaderOrigin = ""
        const currentHost = window.location.hostname
        if (currentHost === "localhost" || currentHost === "127.0.0.1") {
          bootloaderOrigin = `${window.location.protocol}//localhost:3002`
        } else {
          bootloaderOrigin = `https://sandbox.codescapes.io`
        }

        debug.log("[Bridge] Hot Swapping Files...")
        iframeRef.current.contentWindow?.postMessage(
          {
            type: "COMPILE_FILES",
            payload: { scapeId, socketId, files: filesRef.current, env: envRef.current },
          },
          bootloaderOrigin
        )
      }
    }
  }, [filesHash, versionKey, bridgeState.ready, scapeId, socketId, iframeRef])

  return bridgeState
}
