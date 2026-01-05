import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GitFork, Code2, MoreHorizontal } from "lucide-react"
import { optimizeSupabaseImage } from "@/lib/utils"
import type { Scape } from "@/lib/db"

interface ProfileScapeCardProps {
  scape: Scape
  onClick?: () => void
  onFork?: () => void
}

export function ProfileScapeCard({ scape, onClick, onFork }: ProfileScapeCardProps) {
  const getIcon = (env: string) => {
    switch (env) {
      case "python":
        return <Code2 className="h-3 w-3" />
      case "web":
        return <div className="h-2 w-2 rounded-full bg-blue-500" />
      case "flowscape":
        return <div className="h-2 w-2 rounded-full bg-purple-500" />
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500" />
    }
  }

  const isDeployed = !!scape.published_version_id

  return (
    <Card
      className={`group relative aspect-square overflow-hidden rounded-xl border-0 shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Background Thumbnail */}
      <div className="absolute inset-0 z-0">
        {scape.thumbnail ? (
          <img
            src={optimizeSupabaseImage(scape.thumbnail, 400)}
            alt={scape.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50">
            {getIcon(scape.environment)}
          </div>
        )}
      </div>

      {/* Contrast Overlay - Consistent dark overlay for both modes */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/80 group-hover:via-black/40" />

      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-1.5">
        {/* Top Row: Deployment Badge / Env & Actions */}
        <div className="flex items-start justify-between">
          {isDeployed ? (
            <div className="rounded-full bg-green-500/30 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-green-400 backdrop-blur-sm">
              Live
            </div>
          ) : (
            <div /> // Spacer
          )}

          {/* Actions Menu (Hidden until hover) */}
          <div
            className="opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onFork}>
                  <GitFork className="mr-2 h-3 w-3" />
                  Fork
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-0.5">
          <h3 className="line-clamp-1 text-[11px] font-semibold leading-tight text-white">
            {scape.name}
          </h3>
          <div className="flex items-center gap-1 opacity-80">
            {getIcon(scape.environment)}
            <span className="text-[8px] font-medium uppercase tracking-wider text-white/70">
              {scape.environment}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
