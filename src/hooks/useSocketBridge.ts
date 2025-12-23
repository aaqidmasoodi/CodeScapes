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
        broadcast: { self: false }, // Don't receive own messages
      },
    })

    channel
      .on("broadcast", { event: "*" }, (payload) => {
        // Payload structure form Supabase: { event: 'event_name', payload: { ... }, type: 'broadcast' }
        // We expect our emit to send: { event: 'custom_event', data: ... } inside the payload
        // Wait, supabase broadcast sends:
        // channel.send({ type: 'broadcast', event: 'test', payload: { ... } })
        // The listener receives: { event: 'test', payload: { ... }, ... }

        // We will normalize this.
        if (payload.event && payload.payload) {
          onEventRef.current(payload.event, payload.payload)
        }
      })
      .on("presence", { event: "sync" }, () => {
        // Handle presence sync if we add it later
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [scapeId])

  const emit = useCallback((event: string, data: unknown) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: "broadcast",
      event: event,
      payload: data,
    })
  }, [])

  return { emit, isConnected }
}
