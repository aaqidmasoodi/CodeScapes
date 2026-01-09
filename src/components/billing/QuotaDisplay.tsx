/**
 * Quota Display Component
 *
 * Shows remaining prompts and upgrade button for free users.
 */

import { useState, useEffect } from "react"
import { Zap, ArrowUpCircle } from "lucide-react"
import {
  getQuotaStatus,
  formatQuotaDisplay,
  isQuotaExhausted,
  type QuotaStatus,
} from "@/lib/quotaClient"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface QuotaDisplayProps {
  onUpgradeClick?: () => void
  className?: string
  compact?: boolean
}

export function QuotaDisplay({ onUpgradeClick, className, compact = false }: QuotaDisplayProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<QuotaStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchStatus = async () => {
      try {
        const quotaStatus = await getQuotaStatus()
        setStatus(quotaStatus)
      } catch (error) {
        console.error("Failed to fetch quota status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [user])

  if (!user || loading) return null
  if (!status) return null

  // Pro users don't need to see quota
  if (status.tier === "pro") {
    if (compact) return null
    return (
      <div className={cn("flex items-center gap-2 text-sm text-emerald-500", className)}>
        <Zap className="h-4 w-4" />
        <span>Pro</span>
      </div>
    )
  }

  const exhausted = isQuotaExhausted(status)
  const display = formatQuotaDisplay(status)

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs",
          exhausted ? "text-red-400" : "text-muted-foreground",
          className
        )}
      >
        <Zap className="h-3 w-3" />
        <span>{display}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2",
        exhausted ? "border-red-500/30 bg-red-500/10" : "border-muted bg-muted/30",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Zap className={cn("h-4 w-4", exhausted ? "text-red-400" : "text-muted-foreground")} />
        <span className={cn("text-sm font-medium", exhausted ? "text-red-400" : "text-foreground")}>
          {display}
        </span>
      </div>

      {exhausted && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowUpCircle className="h-3.5 w-3.5" />
          Upgrade
        </button>
      )}
    </div>
  )
}

/**
 * Quota Exceeded Banner
 *
 * Full-width banner shown when user hits their limit.
 */
export function QuotaExceededBanner({ onUpgradeClick }: { onUpgradeClick?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <Zap className="h-5 w-5 text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-400">Daily prompt limit reached</p>
          <p className="text-xs text-muted-foreground">
            Upgrade to Pro for unlimited Scapper prompts
          </p>
        </div>
      </div>

      {onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowUpCircle className="h-4 w-4" />
          Upgrade to Pro
        </button>
      )}
    </div>
  )
}
