import { useEffect, useRef, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useSocketBridge(
  scapeId: string | undefined,
  onEvent: (event: string, data: unknown) => void,
  enabled: boolean = true
) {
  const [isConnected, setIsConnected] = useState(false)

  // Channels Map: "global" -> Channel, "room:xyz" -> Channel
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map())
  const onEventRef = useRef(onEvent)

  // Use state for stable ID that is safe to read in render
  const [socketId] = useState(() => crypto.randomUUID())

  // Keep callback fresh
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  // Helper to setup a channel
  const setupChannel = useCallback(
    (name: string, isGlobal = false) => {
      if (!scapeId || !enabled) return
      if (channelsRef.current.has(name)) return // Already joined

      // Channel Name Config
      // Global: "room:scapeId"
      // Room: "room:scapeId:roomName"
      const topic = isGlobal ? `room:${scapeId}` : `room:${scapeId}:${name}`

      const channel = supabase.channel(topic, {
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
            ///////////
            onEventRef.current("user-joined", p)
          })
        })
        .on("presence", { event: "leave" }, ({ leftPresences }) => {
          leftPresences.forEach((p) => {
            onEventRef.current("leave", p)
            onEventRef.current("user-left", p)
          })
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            if (isGlobal) setIsConnected(true)

            if (isGlobal) {
              onEventRef.current("connect", { id: socketId })
            }

            try {
              await channel.track({
                id: socketId,
                online_at: new Date().toISOString(),
              })
            } catch (e) {
              console.error("Failed to track presence", e)
            }
          } else {
            if (isGlobal) setIsConnected(false)
            if (status === "CLOSED" || status === "CHANNEL_ERROR") {
              if (isGlobal) onEventRef.current("disconnect", { reason: status })
            }
          }
        })

      channelsRef.current.set(name, channel)
    },
    [scapeId, socketId, enabled]
  )

  // Helper to destroy
  const destroyChannel = useCallback((name: string) => {
    const channel = channelsRef.current.get(name)
    if (channel) {
      supabase.removeChannel(channel)
      channelsRef.current.delete(name)
    }
  }, [])

  // Init Global Channel
  useEffect(() => {
    if (!scapeId || !enabled) return
    setupChannel("global", true)

    return () => {
      // Cleanup ALL
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch))
      channelsRef.current.clear()
      setIsConnected(false)
    }
  }, [scapeId, setupChannel, enabled])

  const emit = useCallback((event: string, data: unknown, room?: string) => {
    // Default to global if no room specified
    const target = room || "global"
    const channel = channelsRef.current.get(target)

    if (!channel) {
      console.warn(`[Socket] Attempted to emit to non-joined room: ${target}`)
      return
    }

    channel.send({
      type: "broadcast",
      event: event,
      payload: data,
    })
  }, [])

  const joinRoom = useCallback(
    (roomName: string) => {
      setupChannel(roomName, false)
    },
    [setupChannel]
  )

  const leaveRoom = useCallback(
    (roomName: string) => {
      destroyChannel(roomName)
    },
    [destroyChannel]
  )

  return { emit, joinRoom, leaveRoom, isConnected, socketId }
}
