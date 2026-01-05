import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { supabase } from "@/lib/supabase"

const repo = new CloudRepository()

export interface Notification {
  id: string
  type: "like" | "comment" | "fork" | "follow" | "system"
  actor: {
    username: string
    avatar_url: string
    full_name: string
  } | null
  scape: {
    id: string
    name: string
    thumbnail: string
  } | null
  message: string | null
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const initializedRef = useRef(false)

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (showLoading = false) => {
      if (!user) return
      if (showLoading) setLoading(true)
      try {
        const data = await repo.getNotifications(user.id)
        setNotifications(data as Notification[])
      } catch (e) {
        console.error("Failed to fetch notifications:", e)
      } finally {
        if (showLoading) setLoading(false)
      }
    },
    [user]
  )

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const count = await repo.getUnreadNotificationCount(user.id)
      setUnreadCount(count)
    } catch (e) {
      console.error("Failed to fetch unread count:", e)
    }
  }, [user])

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await repo.markNotificationRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (e) {
      console.error("Failed to mark notification as read:", e)
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return
    try {
      await repo.markAllNotificationsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (e) {
      console.error("Failed to mark all as read:", e)
    }
  }, [user])

  // Initial fetch + realtime subscription
  useEffect(() => {
    if (!user) {
      initializedRef.current = false
      return
    }

    // Initial fetch with loading indicator
    if (!initializedRef.current) {
      initializedRef.current = true
      fetchNotifications(true)
      fetchUnreadCount()
    }

    // Realtime subscription
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications(false)
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchNotifications, fetchUnreadCount])

  // Return default values when not logged in
  if (!user) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      refresh: async () => {},
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: () => fetchNotifications(false),
  }
}
