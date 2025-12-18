import { useState, useEffect, useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { type Scape } from "@/lib/db"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { useAuth } from "@/hooks/useAuth"

const localRepo = new LocalRepository()
const cloudRepo = new CloudRepository()

export function useScapes() {
  const { user, loading: authLoading } = useAuth()
  const [cloudScapes, setCloudScapes] = useState<Scape[]>([])
  const [loadingCloud, setLoadingCloud] = useState(false)

  // 1. Local Scapes (Live)
  const localScapes = useLiveQuery(() => localRepo.listScapes(), [])

  // 2. Cloud Scapes (Effect)
  useEffect(() => {
    if (!user) {
      setCloudScapes([])
      return
    }

    let isMounted = true
    const fetchCloud = async () => {
      setLoadingCloud(true)
      try {
        const scapes = await cloudRepo.listScapes(user.id)
        if (isMounted) setCloudScapes(scapes)
      } catch (e) {
        console.error("Failed to fetch cloud scapes", e)
      } finally {
        if (isMounted) setLoadingCloud(false)
      }
    }

    fetchCloud()
    return () => {
      isMounted = false
    }
  }, [user])

  // 3. Merge & Sort (Deduplicate)
  const combinedScapes = useMemo(() => {
    const local = localScapes || []
    const cloud = cloudScapes || []

    const cloudIds = new Set(cloud.map((s) => s.id))
    // Only show local scapes that are NOT in the cloud list
    const uniqueLocal = local.filter((s) => !cloudIds.has(s.id))

    return [...uniqueLocal, ...cloud].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [localScapes, cloudScapes])

  const deleteScape = async (scape: Scape) => {
    try {
      if (scape.source === "cloud") {
        await cloudRepo.deleteScape(scape.id)
        // Optimistic update
        setCloudScapes((prev) => prev.filter((s) => s.id !== scape.id))
      } else {
        await localRepo.deleteScape(scape.id)
      }
    } catch (e) {
      console.error("Failed to delete scape", e)
      throw e
    }
  }

  return {
    scapes: combinedScapes,
    loading: authLoading || !localScapes || loadingCloud,
    deleteScape,
  }
}
