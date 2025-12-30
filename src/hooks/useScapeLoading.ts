import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, type Scape } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { debug } from "@/lib/debug"

export type ScapeSource = "local" | "cloud"

export function useScapeLoading(id: string, options?: { skipLocal?: boolean }) {
  const [cloudScape, setCloudScape] = useState<Scape | null>(null)
  const [cloudError, setCloudError] = useState<Error | null>(null)
  const [isCloudLoading, setIsCloudLoading] = useState(true)

  // 1. Try Local First (Live Logic) - Only if not skipped
  const localScape = useLiveQuery(() => {
    if (options?.skipLocal) return undefined
    return db.scapes.get(id)
  }, [id, options?.skipLocal])

  // 2. If not found locally, try Cloud
  useEffect(() => {
    // If localScape is undefined (still loading) or found (exists), we don't need to fetch cloud yet?
    // Wait, useLiveQuery returns undefined while loading, and undefined if not found.
    // Dexie: if not found, distinct from loading? `useLiveQuery` initial return is undefined.
    // Actually `useLiveQuery` executes immediately if possible? No.
    // To distinguish "not found" vs "loading", we need a bit more care.
    // But for MVP: If localScape happens to be undefined, let's assume "not found locally" and trigger cloud fetch?
    // Problem: Race condition.

    // Better approach:
    // Always trigger cloud fetch if ID looks like UUID?
    // Or just run both in parallel?
    // If we have local, use it. If not, wait for cloud.

    if (!options?.skipLocal && localScape !== undefined) return // We have a local result
    // Actually Dexie hooks return undefined initially then the value. If value is undefined, it means record not found.

    // Let's explicitly check:
    let isMounted = true

    const checkCloud = async () => {
      // Small delay to let Dexie resolve?
      // Or just check Cloud if we suspect it's there.
      // If we blindly fetch Cloud every time, it's valid but wasteful for local scapes.

      // Heuristic: If we don't have localScape after a tick, or if we just want to support direct link.
      const { data, error } = await supabase.from("scapes").select("*").eq("id", id).single()

      if (!isMounted) return

      if (error) {
        if (error.code !== "PGRST116") {
          // 116 is Row not found
          setCloudError(error)
        }
        // Whether error or 404, we are done checking cloud
        setIsCloudLoading(false)
        return
      }

      if (data) {
        // Found in cloud
        setCloudScape({
          id: data.id,
          name: data.name,
          description: data.description || undefined,
          environment: data.environment as Scape["environment"],
          template: data.template,
          source: "cloud",
          authorId: data.author_id,
          syncStatus: "synced",
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          thumbnail: data.thumbnail,
          dependencies: data.dependencies || [],
          is_public: data.is_public || false,
        })
      }
      setIsCloudLoading(false)
    }

    // Only fetch cloud if we have no local scape roughly "settled"
    // Since we can't easily tell "Dexie finished loading and found nothing",
    // We might just fire the Cloud request if `localScape` is falsy.
    // But this fires even during initial load.

    // Let's just fire it. Supabase is fast.
    // Optimized Loading Strategy:
    // 1. Check Local DB explicitly (awaitable).
    // 2. Only check Cloud if Local returns nothing.
    const runStrategy = async () => {
      if (!options?.skipLocal) {
        const localEntry = await db.scapes.get(id)
        if (localEntry) {
          // It exists locally! Do not touch the cloud.
          if (isMounted) setIsCloudLoading(false)
          return
        }
      }
      // Not found locally? Go to cloud.
      if (isMounted) checkCloud()
    }

    runStrategy()

    // --- Real-Time Subscription ---
    const channel = supabase
      .channel(`scape-meta:${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "scapes",
          // Client-side filtering is more robust against RLS/filter interactions
        },
        (payload) => {
          const newData = payload.new
          // Client-Side Filter
          if (newData && newData.id === id) {
            debug.log("Realtime Scape Update:", newData)
            setCloudScape((prev) => {
              // If we have no previous state, we can't merge reliably unless payload is full.
              // With REPLICA IDENTITY FULL, newData is full.
              // Safe Merge: prefer newData, fallback to prev

              const base = prev || ({} as Scape)

              return {
                ...base,
                // If newData has property, use it. If not, keep prev.
                // Note: newData from Supabase with REPLICA IDENTITY FULL should have all columns.
                // But we safeguard against partials.
                name: newData.name !== undefined ? newData.name : base.name,
                description:
                  newData.description !== undefined ? newData.description : base.description,
                dependencies:
                  newData.dependencies !== undefined
                    ? newData.dependencies
                    : base.dependencies || [],
                updatedAt: newData.updated_at ? new Date(newData.updated_at) : base.updatedAt,
                thumbnail: newData.thumbnail !== undefined ? newData.thumbnail : base.thumbnail,

                // Ensure key fields are preserved if not in payload (unlikely with Full Identity)
                id: id,
                source: "cloud",
                environment: newData.environment
                  ? (newData.environment as Scape["environment"])
                  : base.environment,
                template: newData.template || base.template,
                authorId: base.authorId,
                syncStatus: "synced",
                createdAt: base.createdAt || new Date(),
                is_public: newData.is_public !== undefined ? newData.is_public : base.is_public,
              } as Scape
            })
          }
        }
      )
      .on("broadcast", { event: "scape_update" }, (payload) => {
        const newData = payload.payload
        const data = newData as Partial<Scape>

        if (data) {
          debug.log("Broadcast Scape Update:", data)
          setCloudScape((prev) => {
            const base = prev || ({} as Scape)
            return {
              ...base,
              ...data,
              id: id,
              source: "cloud",
              is_public: data.is_public !== undefined ? data.is_public : base.is_public,
            } as Scape
          })
        }
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // useCallback to stabilize emitUpdate for consumers

  const emitUpdate = async (updates: Partial<Scape>) => {
    if (!id) return
    await supabase.channel(`scape-meta:${id}`).send({
      type: "broadcast",
      event: "scape_update",
      payload: updates,
    })
  }

  // Prioritize Local, then Cloud
  const scape = localScape ?? cloudScape

  // Loading state logic:
  // We are loading if we don't have a scape yet AND we are still fetching cloud.
  // Note: localScape being undefined is ambiguous (Loading vs Not Found), so we don't block on it if cloud is done.
  const isLoading = !scape && isCloudLoading

  return {
    scape,
    source: (scape?.source === "cloud" ? "cloud" : "local") as ScapeSource,
    isLoading,
    error: cloudError,
    emitUpdate,
  }
}
