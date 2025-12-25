import { useState, useEffect, useCallback } from "react"

export interface AppStatus {
  // Network
  isOnline: boolean

  // Service Worker
  swStatus: "active" | "installing" | "waiting" | "error" | "unsupported"
  swVersion: string | null
  hasUpdate: boolean

  // Methods
  updateServiceWorker: () => Promise<void>
}

export function useAppStatus(): AppStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [swStatus, setSwStatus] = useState<AppStatus["swStatus"]>(
    "serviceWorker" in navigator ? "active" : "unsupported"
  )
  const [swVersion, setSwVersion] = useState<string | null>(null)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Service Worker status
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return
    }

    const checkSWStatus = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        setRegistration(reg || null)

        if (!reg) {
          setSwStatus("error")
          return
        }

        if (reg.installing) {
          setSwStatus("installing")
        } else if (reg.waiting) {
          setSwStatus("waiting")
          setHasUpdate(true)
        } else if (reg.active) {
          setSwStatus("active")
        }

        // Listen for updates
        reg.addEventListener("updatefound", () => {
          setSwStatus("installing")
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setSwStatus("waiting")
                setHasUpdate(true)
              }
            })
          }
        })

        // Get SW version via message
        if (reg.active) {
          const messageChannel = new MessageChannel()
          messageChannel.port1.onmessage = (event) => {
            if (event.data?.version) {
              setSwVersion(event.data.version)
            }
          }
          reg.active.postMessage({ type: "GET_VERSION" }, [messageChannel.port2])
        }
      } catch (e) {
        console.error("[useAppStatus] SW check failed:", e)
        setSwStatus("error")
      }
    }

    // Check immediately and when controller changes
    checkSWStatus()

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      setSwStatus("active")
      setHasUpdate(false)
    })
  }, [])

  // Update SW method
  const updateServiceWorker = useCallback(async () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
    }
  }, [registration])

  return {
    isOnline,
    swStatus,
    swVersion,
    hasUpdate,
    updateServiceWorker,
  }
}
