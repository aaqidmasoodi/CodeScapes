import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, GitFork, User, Code2, MoreHorizontal } from "lucide-react"
import { optimizeSupabaseImage } from "@/lib/utils"
import type { Scape } from "@/lib/db"

interface ScapeCardProps {
  scape: Scape
  onClick?: () => void
  onFork?: () => void
}

export function ScapeCard({ scape, onClick, onFork }: ScapeCardProps) {
  const getIcon = (env: string) => {
    switch (env) {
      case "python":
        return <Code2 className="h-4 w-4 text-yellow-500" />
      case "web":
        return <div className="h-4 w-4 rounded-full bg-blue-500" />
      case "flowscape":
        return <div className="h-4 w-4 rounded-full bg-purple-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-500" />
    }
  }

  const getEnvLabel = (env: string) => {
    switch (env) {
      case "python":
        return "Python"
      case "web":
        return "Web"
      case "flowscape":
        return "FlowScape"
      default:
        return env || "Unknown"
    }
  }

  return (
    <Card
      className={`group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Actions Menu */}
      <div
        className="absolute right-2 top-2 z-20 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onFork}>
              <GitFork className="mr-2 h-4 w-4" />
              Fork Scape
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {scape.thumbnail ? (
          <img
            src={optimizeSupabaseImage(scape.thumbnail, 600)}
            alt={scape.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary/20">
            {getIcon(scape.environment)}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
      </div>

      <CardHeader className="p-3 pb-1.5">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-sm font-medium leading-none">
            {scape.name}
          </CardTitle>
          <Badge variant="outline" className="h-5 px-1 text-[10px]">
            {getEnvLabel(scape.environment)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {scape.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {scape.author?.avatar ? (
            <img
              src={optimizeSupabaseImage(scape.author.avatar, 64, 64)}
              alt="Author"
              className="h-3.5 w-3.5 rounded-full"
            />
          ) : (
            <User className="h-3 w-3" />
          )}
          <span className="truncate">{scape.author?.name || "Unknown"}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{scape.stats?.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            <span>{scape.stats?.forks || 0}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
