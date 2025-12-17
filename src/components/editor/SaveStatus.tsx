import { RotateCw, AlertCircle, Cloud, CloudOff } from "lucide-react"

interface SaveStatusProps {
  state: "idle" | "saving" | "saved" | "error"
  lastSaved: Date | null
  source: "local" | "cloud"
}

export function SaveStatus({ state, lastSaved, source }: SaveStatusProps) {
  if (state === "error") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Failed to save</span>
      </div>
    )
  }

  if (state === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <RotateCw className="h-3 w-3 animate-spin" />
        <span>Saving...</span>
      </div>
    )
  }

  if (state === "saved" || (state === "idle" && lastSaved)) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
        {source === "cloud" ? (
          <Cloud className="h-4 w-4" />
        ) : (
          <CloudOff className="h-4 w-4 opacity-50" />
        )}
        <span>Saved {lastSaved ? "just now" : ""}</span>
      </div>
    )
  }

  return null
}
