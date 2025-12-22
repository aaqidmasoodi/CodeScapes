import { useState, useLayoutEffect, useMemo, useRef } from "react"
import type { ScapeFile } from "@/types/file"

// We are now fully committed to the Cross-Origin Bootloader architecture.
// There is no more "Same Origin" mode.

interface PreviewBridge {
  ready: boolean
  url: string
}

// Helper for simple deterministic hash
const computeHash = (str: string) => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0
  }
  return h.toString(36)
}

export function usePreviewBridge(
  files: ScapeFile[],
  scapeId: string,
  iframeRef?: React.RefObject<HTMLIFrameElement | null>,
  env?: Record<string, string>,
  versionKey?: number
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
    let bootloaderOrigin = ""
    const currentHost = window.location.hostname
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      bootloaderOrigin = `${window.location.protocol}//localhost:3002`
    } else {
      bootloaderOrigin = window.location.origin
    }
    const version = versionKey || Date.now()
    const hash = computeHash(filesHash)
    return {
      ready: false,
      url: `${bootloaderOrigin}/sandbox/bootloader.html?v=${version}&h=${hash}`,
    }
  })

  // Render-time state derivation
  if (versionKey !== prevVersionKey) {
    setPrevVersionKey(versionKey)
    setPrevFilesHash(filesHash)

    let bootloaderOrigin = ""
    const currentHost = window.location.hostname
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      bootloaderOrigin = `${window.location.protocol}//localhost:3002`
    } else {
      bootloaderOrigin = window.location.origin
    }

    const version = versionKey ?? 0
    const hash = computeHash(filesHash)
    const bootloaderUrl = `${bootloaderOrigin}/sandbox/bootloader.html?v=${version}&h=${hash}`

    setBridgeState({ ready: false, url: bootloaderUrl })
  } else if (filesHash !== prevFilesHash && env?.hotUpdate && bridgeState.ready) {
    setPrevFilesHash(filesHash)
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

  // Revised Hot Update Effect using Ref for stability check
  const lastSentHash = useRef<string>(filesHash)

  useLayoutEffect(() => {
    if (env?.hotUpdate && bridgeState.ready && iframeRef?.current) {
      if (lastSentHash.current !== filesHash) {
        lastSentHash.current = filesHash

        // Determine Origin (Re-used logic, maybe should extract)
        let bootloaderOrigin = ""
        const currentHost = window.location.hostname
        if (currentHost === "localhost" || currentHost === "127.0.0.1") {
          bootloaderOrigin = `${window.location.protocol}//localhost:3002`
        } else {
          bootloaderOrigin = window.location.origin
        }

        console.log("[Bridge] Hot Swapping Files...")
        iframeRef.current.contentWindow?.postMessage(
          {
            type: "COMPILE_FILES",
            payload: { scapeId, files, env },
          },
          bootloaderOrigin
        )
      }
    }
  }, [filesHash, files, bridgeState.ready, env, iframeRef, scapeId])

  return bridgeState
}
