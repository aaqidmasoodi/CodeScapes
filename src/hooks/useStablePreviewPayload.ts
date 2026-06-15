import { useState, useEffect, useMemo } from "react"
import type { ScapeFile } from "@/types/file"
import { secretsService } from "@/lib/services/secrets"

export interface StablePreviewPayload {
  files: ScapeFile[]
  env: Record<string, string>
  isReady: boolean
}

/**
 * Batches all async dependencies (files, secrets) into a single stable object.
 * The preview should NOT mount until this hook returns isReady: true.
 * This prevents listener thrashing in usePreviewBridge.
 */
export function useStablePreviewPayload(
  scapeId: string,
  files: ScapeFile[]
): StablePreviewPayload | null {
  const [secrets, setSecrets] = useState<Record<string, string> | null>(null)
  const [secretsLoaded, setSecretsLoaded] = useState(false)

  // Fetch secrets once per scapeId
  useEffect(() => {
    if (!scapeId) return

    secretsService
      .getSecrets(scapeId)
      .then((secretsList) => {
        const map: Record<string, string> = {}
        secretsList.forEach((s) => (map[s.key] = s.value))
        setSecrets(map)
        setSecretsLoaded(true)
      })
      .catch((err) => {
        console.error("[useStablePreviewPayload] Failed to load secrets:", err)
        setSecrets({})
        setSecretsLoaded(true)
      })
  }, [scapeId])

  // Compute stable payload only when all dependencies are ready
  const payload = useMemo<StablePreviewPayload | null>(() => {
    // Not ready until:
    // 1. We have files
    // 2. Secrets have loaded (even if empty)
    if (files.length === 0 || !secretsLoaded) {
      return null
    }

    return {
      files,
      env: { ...secrets, hotUpdate: "true" },
      isReady: true,
    }
  }, [files, secrets, secretsLoaded])

  return payload
}
