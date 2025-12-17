import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Loader2, AlertCircle } from "lucide-react"
import { useServiceWorkerFS } from "@/hooks/useServiceWorkerFS"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { PythonRunner } from "@/runners/python/PythonRunner"
import type { ScapeFile } from "@/types/file"
import type { Scape } from "@/lib/db"

const localRepo = new LocalRepository()
const cloudRepo = new CloudRepository()

export default function ScapeRunnerPage() {
  const { scapeId } = useParams()
  const [scape, setScape] = useState<Scape | null>(null)
  const [files, setFiles] = useState<ScapeFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hydrate Service Worker with fetched files
  // We only really need this for Web/HTML scapes, but it doesn't hurt for Python
  // (though checking environment first would be an optimization)
  const isServiceWorkerReady = useServiceWorkerFS(files)

  useEffect(() => {
    async function fetchScape() {
      if (!scapeId) return
      setLoading(true)
      setError(null)

      try {
        console.log(`[Runner] Booting Scape: ${scapeId}`)

        // 1. Try Local Repository (Fastest, Dev Work)
        const localScape = await localRepo.getScape(scapeId)
        if (localScape) {
          console.log("[Runner] Found in Local DB")
          const localFiles = await localRepo.getFiles(scapeId)
          setScape(localScape)
          setFiles(localFiles)
          setLoading(false)
          return
        }

        // 2. Try Cloud Repository (Shared / Public)
        console.log("[Runner] Looking in Cloud DB...")
        const cloudScape = await cloudRepo.getScape(scapeId)
        if (cloudScape) {
          console.log("[Runner] Found in Cloud DB")
          const cloudFiles = await cloudRepo.getFiles(scapeId)
          setScape(cloudScape)
          setFiles(cloudFiles)
          setLoading(false)
          return
        }

        setError("Scape not found")
      } catch (err) {
        console.error("[Runner] Fetch Error:", err)
        setError("Failed to load Scape. It may be private or deleted.")
      } finally {
        setLoading(false)
      }
    }

    fetchScape()
  }, [scapeId])

  // Logic to determine readiness
  // If Python, we don't wait for SW. If Web, we do.
  const isPython = scape?.environment === "python" || scape?.environment === "data-science"
  const isReady = !loading && (isPython || isServiceWorkerReady)

  if (!scape && loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="font-mono text-sm text-muted-foreground">Booting Scape System...</p>
      </div>
    )
  }

  if (error || !scape) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-destructive">
        <AlertCircle className="mb-4 h-12 w-12" />
        <h2 className="text-xl font-bold">Error</h2>
        <p className="mt-2 text-muted-foreground">{error || "Scape not found"}</p>
      </div>
    )
  }

  // Not ready yet (e.g. SW hydrating for Web)
  if (!isReady) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="font-mono text-sm text-muted-foreground">Preparing Environment...</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      {isPython ? (
        <PythonRunner
          files={files}
          dependencies={scape.dependencies}
          // Suppress stdout for clean player experience, or log to console
          onOutput={(log) => console.debug("[Player Output]", log)}
        />
      ) : (
        <iframe
          src="/preview-v3/index.html"
          className="h-full w-full border-0 bg-white"
          title="Scape Runner"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; display-capture"
        />
      )}
    </div>
  )
}
