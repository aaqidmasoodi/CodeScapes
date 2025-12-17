import { useEffect, useState } from "react"
import type { ScapeFile } from "@/types/file"

export function useServiceWorkerFS(files: ScapeFile[]) {
  const [isReady, setIsReady] = useState(false)
  const [worker, setWorker] = useState<ServiceWorker | null>(null)

  // 1. Register Service Worker and get instance
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.error("Service Worker not supported")
      return
    }

    const register = async () => {
      try {
        // Unregister old scope if it exists (cleanup)
        try {
          const oldReg = await navigator.serviceWorker.getRegistration("/preview-v2/")
          if (oldReg) await oldReg.unregister()
        } catch {
          /* ignore */
        }

        // Add timestamp/version to force byte-check update
        const registration = await navigator.serviceWorker.register("/sw.js?v=" + Date.now(), {
          scope: "/preview-v3/",
          updateViaCache: "none",
        })

        // Helper to set worker from registration
        const handleRegistration = (reg: ServiceWorkerRegistration) => {
          if (reg.active) {
            setWorker(reg.active)
          } else if (reg.waiting) {
            setWorker(reg.waiting)
          } else if (reg.installing) {
            const newWorker = reg.installing
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "activated") {
                setWorker(newWorker)
              }
            })
          }
        }

        handleRegistration(registration)

        // Also listen for updates
        registration.addEventListener("updatefound", () => {
          if (registration.installing) {
            const newWorker = registration.installing
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "activated") {
                setWorker(newWorker)
              }
            })
          }
        })
      } catch (e) {
        console.error("SW Registration failed:", e)
      }
    }

    register()
  }, [])

  // 2. Sync Files & Handshake
  useEffect(() => {
    if (!worker || files.length === 0) return

    // Reset ready state when files change to ensure we don't serve stale content
    // or race with updates.
    // eslint-disable-next-line
    setIsReady(false)

    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data.type === "ACK") {
        // Only NOW are we ready
        setIsReady(true)
      }
    }

    worker.postMessage(
      {
        type: "FILE_UPDATE",
        payload: {
          clear: true,
          files: files.map((f) => ({
            name: f.name,
            content: f.content,
          })),
        },
      },
      [channel.port2]
    )
  }, [files, worker])

  return isReady
}
