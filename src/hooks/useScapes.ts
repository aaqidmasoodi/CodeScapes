import { useMemo, useCallback } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { type Scape } from "@/lib/db"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { useAuth } from "@/hooks/useAuth"

const localRepo = new LocalRepository()
const cloudRepo = new CloudRepository()

export function useScapes() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  // Derived ID for stable dependency (prevent refetch on object reference change)
  const userId = user?.id

  // 1. Local Scapes (Live from Dexie)
  const localScapes = useLiveQuery(() => localRepo.listScapes(), [])

  // 2. Cloud Scapes (React Query with SWR caching)
  const { data: cloudScapes = [], isLoading: loadingCloud } = useQuery({
    queryKey: ["cloudScapes", userId],
    queryFn: async () => {
      if (!userId) return []
      return cloudRepo.listScapes(userId)
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - data considered fresh
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  })

  // 3. Merge & Sort (Deduplicate)
  const combinedScapes = useMemo(() => {
    const rawLocal = localScapes || []

    // If not logged in, ONLY show strictly local scapes (ignore cached cloud ones)
    if (!user) {
      return rawLocal
        .filter((s) => s.source === "local")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }

    // Filter local cache: Remove cloud scapes that don't belong to current user
    const local = rawLocal.filter((s) => {
      if (s.source === "local") return true
      // If it's a cached cloud scape, it MUST belong to the current user
      return s.authorId === user.id
    })

    const cloud = cloudScapes || []

    const cloudIds = new Set(cloud.map((s) => s.id))
    // Only show local scapes that are NOT in the cloud list
    const uniqueLocal = local.filter((s) => !cloudIds.has(s.id))

    return [...uniqueLocal, ...cloud].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [localScapes, cloudScapes, user])

  const deleteScape = useCallback(
    async (scape: Scape) => {
      try {
        if (scape.source === "cloud") {
          await cloudRepo.deleteScape(scape.id)
          // Also delete from local (offline cache) to prevent ghosts
          await localRepo.deleteScape(scape.id)

          // Invalidate cache to refetch
          queryClient.invalidateQueries({ queryKey: ["cloudScapes"] })
        } else {
          await localRepo.deleteScape(scape.id)
        }
      } catch (e) {
        console.error("Failed to delete scape", e)
        throw e
      }
    },
    [queryClient]
  )

  return {
    scapes: combinedScapes,
    loading: authLoading || !localScapes || loadingCloud,
    deleteScape,
  }
}
