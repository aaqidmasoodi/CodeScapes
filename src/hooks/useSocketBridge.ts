import { useEffect, useRef, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useSocketBridge(
  scapeId: string | undefined,
  onEvent: (event: string, data: unknown) => void
) {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onEventRef = useRef(onEvent)
  const [socketId] = useState(() => crypto.randomUUID()) // Persistent ID for this session

  // Keep callback fresh
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!scapeId) return

    // Create Channel
    // We use a unique name per scape.
    // 'broadcast' type ensures it's ephemeral and fast.
    const channel = supabase.channel(`room:${scapeId}`, {
      config: {
        broadcast: { self: false },
        presence: {
          key: socketId,
        },
      },
    })

    channel
      .on("broadcast", { event: "*" }, (payload) => {
        if (payload.event && payload.payload) {
          onEventRef.current(payload.event, payload.payload)
        }
      })
      // Standard Presence Events (Synthesized as 'join', 'leave', 'presence')
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        // Convert to simple list of objects
        const presenceList = Object.values(state).flat()
        onEventRef.current("presence", presenceList)
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        newPresences.forEach((p) => {
          onEventRef.current("join", p)
          onEventRef.current("user-joined", p) // Alias for user request
        })
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        leftPresences.forEach((p) => {
          onEventRef.current("leave", p)
          onEventRef.current("user-left", p) // Alias for user request
        })
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)

          // 1. Send 'connect' event to the runner
          onEventRef.current("connect", { id: socketId })

          // 2. Track Presence
          await channel.track({
            id: socketId,
            online_at: new Date().toISOString(),
          })
        } else {
          setIsConnected(false)
          if (status === "CLOSED" || status === "CHANNEL_ERROR") {
            onEventRef.current("disconnect", { reason: status })
          }
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [scapeId, socketId])

  const emit = useCallback((event: string, data: unknown) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: "broadcast",
      event: event,
      payload: data,
    })
  }, [])

  return { emit, isConnected, socketId }
}
