import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, GitFork, Bell } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Notification } from "@/hooks/useNotifications"

interface NotificationItemProps {
  notification: Notification
  onRead: () => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { type, actor, scape, is_read, created_at } = notification

  const getIcon = () => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "fork":
        return <GitFork className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getMessage = () => {
    const actorName = actor?.full_name || actor?.username || "Someone"
    const scapeName = scape?.name || "your scape"

    switch (type) {
      case "like":
        return (
          <>
            <span className="font-medium">{actorName}</span> liked{" "}
            <span className="font-medium">{scapeName}</span>
          </>
        )
      case "comment":
        return (
          <>
            <span className="font-medium">{actorName}</span> commented on{" "}
            <span className="font-medium">{scapeName}</span>
          </>
        )
      case "fork":
        return (
          <>
            <span className="font-medium">{actorName}</span> forked{" "}
            <span className="font-medium">{scapeName}</span>
          </>
        )
      default:
        return notification.message || "You have a new notification"
    }
  }

  const handleClick = () => {
    if (!is_read) {
      onRead()
    }
  }

  const content = (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 ${
        !is_read ? "bg-primary/5" : ""
      }`}
      onClick={handleClick}
    >
      {/* Actor Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={actor?.avatar_url} />
        <AvatarFallback>{actor?.username?.slice(0, 2).toUpperCase() || "?"}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="shrink-0 pt-0.5">{getIcon()}</div>
          <p className="text-sm leading-relaxed text-foreground">{getMessage()}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Unread indicator */}
      {!is_read && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </div>
  )

  // If there's a scape, link to it
  if (scape?.id) {
    return (
      <Link to={`/community/scape/${scape.id}`} className="block">
        {content}
      </Link>
    )
  }

  return content
}
