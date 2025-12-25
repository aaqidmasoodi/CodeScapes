import { Wifi, WifiOff, Zap, AlertTriangle, Cloud, Database, RefreshCw } from "lucide-react"
import { useAppStatus } from "@/hooks/useAppStatus"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface StatusBarProps {
  source?: "local" | "cloud"
  environment?: string
  className?: string
}

export function StatusBar({ source = "local", environment = "web", className }: StatusBarProps) {
  const { isOnline, swStatus, hasUpdate, updateServiceWorker } = useAppStatus()

  const envLabels: Record<string, string> = {
    web: "Web",
    python: "Python",
    flowscape: "FlowScape",
    node: "Node",
  }

  return (
    <div
      className={cn(
        "flex h-6 items-center justify-between border-t bg-muted/50 px-3 text-xs text-muted-foreground",
        className
      )}
    >
      {/* Left side - Status indicators */}
      <div className="flex items-center gap-3">
        {/* Network Status */}
        <div
          className="flex cursor-default items-center gap-1.5"
          title={isOnline ? "Connected to internet" : "No internet connection"}
        >
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-500" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-yellow-500" />
              <span className="hidden text-yellow-500 sm:inline">Offline</span>
            </>
          )}
        </div>

        {/* Service Worker Status */}
        <div
          className="flex cursor-default items-center gap-1.5"
          title={
            swStatus === "active"
              ? "Service Worker running"
              : swStatus === "installing"
                ? "Installing new version..."
                : swStatus === "waiting"
                  ? "New version ready - click Apply Update"
                  : "Service Worker error"
          }
        >
          {swStatus === "active" && (
            <>
              <Zap className="h-3.5 w-3.5 text-green-500" />
              <span className="hidden sm:inline">SW Active</span>
            </>
          )}
          {swStatus === "installing" && (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
              <span className="hidden text-blue-500 sm:inline">Updating...</span>
            </>
          )}
          {swStatus === "waiting" && (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-yellow-500" />
              <span className="hidden text-yellow-500 sm:inline">Update Ready</span>
            </>
          )}
          {(swStatus === "error" || swStatus === "unsupported") && (
            <>
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <span className="hidden text-red-500 sm:inline">SW Error</span>
            </>
          )}
        </div>

        {/* Update button (if update available) */}
        {hasUpdate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-xs text-yellow-600 hover:text-yellow-700"
            onClick={updateServiceWorker}
          >
            Apply Update
          </Button>
        )}
      </div>

      {/* Right side - Meta info */}
      <div className="flex items-center gap-3">
        {/* Source */}
        <div
          className="flex cursor-default items-center gap-1.5"
          title={source === "cloud" ? "Synced to cloud" : "Stored locally"}
        >
          {source === "cloud" ? (
            <>
              <Cloud className="h-3.5 w-3.5 text-blue-500" />
              <span className="hidden sm:inline">Cloud</span>
            </>
          ) : (
            <>
              <Database className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Local</span>
            </>
          )}
        </div>

        {/* Environment */}
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
          {envLabels[environment] || environment}
        </span>
      </div>
    </div>
  )
}
