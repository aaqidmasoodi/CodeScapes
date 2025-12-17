import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db, type Scape } from "@/lib/db"
import { supabase } from "@/lib/supabase"

export type ScapeSource = "local" | "cloud"

export function useScapeLoading(id: string) {
  const [cloudScape, setCloudScape] = useState<Scape | null>(null)
  const [cloudError, setCloudError] = useState<Error | null>(null)

  // 1. Try Local First (Live Logic)
  const localScape = useLiveQuery(() => db.scapes.get(id), [id])

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

    if (localScape !== undefined) return // We have a result (either object or null/undefined if finished?)
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
        return
      }

      if (data) {
        // Found in cloud
        setCloudScape({
          id: data.id,
          name: data.name,
          environment: data.environment as Scape["environment"],
          template: data.template,
          source: "cloud",
          authorId: data.author_id,
          syncStatus: "synced",
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          thumbnail: data.thumbnail,
          dependencies: data.dependencies || [],
        })
      }
    }

    // Only fetch cloud if we have no local scape roughly "settled"
    // Since we can't easily tell "Dexie finished loading and found nothing",
    // We might just fire the Cloud request if `localScape` is falsy.
    // But this fires even during initial load.

    // Let's just fire it. Supabase is fast.
    checkCloud()

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
            console.log("Realtime Scape Update:", newData)
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
                authorId: base.authorId, // author_id is not expected to change on update
                syncStatus: "synced",
                createdAt: base.createdAt || new Date(), // createdAt is not expected to change on update
              } as Scape
            })
          }
        }
      )
      .on("broadcast", { event: "scape_update" }, (payload) => {
        const newData = payload.payload // Payload structure: { payload: { ... } } ? Checking docs.
        // Supabase sends payload as the argument.
        // But payload includes event, type, payload...
        // "payload" property contains the data sent.
        const data = newData as Partial<Scape>

        if (data) {
          console.log("Broadcast Scape Update:", data)
          setCloudScape((prev) => {
            const base = prev || ({} as Scape)
            return {
              ...base,
              ...data,
              // Preserve ID and critical fields if not in payload
              id: id,
              source: "cloud",
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

  // Loading state is rough here.
  // If both are null/undefined, we are loading.
  const isLoading = localScape === undefined && cloudScape === null && !cloudError

  // If localScape is explicitly undefined (entry not found) AND cloudScape is null (not found) AND not loadingCloud
  // Then strictly 404.
  // But localScape is undefined when loading AND when not found?
  // Dexie docs: "The result of the promise returned by querier. If the promise rejects, the error is returned."
  // "If the function throws, undefined is returned."
  // Wait, if record doesn't exist, get() returns undefined.
  // So `localScape` is `undefined` can mean "loading" OR "not found". This is annoying.

  // Ideally we use `db.scapes.get(id).then(...)` in a `useEffect` for precise control if we mix sources.
  // But `useLiveQuery` is nice for updates.

  // Let's assume if `localScape` is undefined, we *might* be loading or it's missing.
  // The `cloudScape` will fill in if found.

  return {
    scape,
    source: (scape?.source === "cloud" ? "cloud" : "local") as ScapeSource,
    isLoading,
    error: cloudError,
    emitUpdate,
  }
}
