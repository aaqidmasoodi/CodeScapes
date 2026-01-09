/**
 * CodeScapes Pro Modal
 *
 * Shows subscription tier, usage stats, and upgrade option.
 * Opens from sidebar activity bar.
 */

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, Cloud, Rocket, Lock, CheckCircle2 } from "lucide-react"
import { CodeScapeLogo } from "@/components/brand/Logo"
import { ProBadge, ScapperIcon } from "@/components/brand/ScapperIcon"
import { getQuotaStatus, type QuotaStatus } from "@/lib/quotaClient"
import { EmbeddedPaymentForm } from "@/components/billing/StripePaymentForm"
import { useAuth } from "@/hooks/useAuth"

interface ProModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProModal({ isOpen, onClose }: ProModalProps) {
  const { user } = useAuth()
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchQuota = async () => {
    try {
      setLoading(true)
      const status = await getQuotaStatus()
      setQuotaStatus(status)
    } catch (e) {
      console.error("Failed to fetch quota:", e)
    } finally {
      setLoading(false)
    }
  }

  // Fetch quota status when modal opens
  useEffect(() => {
    if (!isOpen || !user) return
    fetchQuota()
  }, [isOpen, user])

  const isPro = quotaStatus?.tier === "pro"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 md:h-[600px]">
        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          {/* LEFT COLUMN: Usage & Stats */}
          <div className="flex flex-col border-r bg-muted/10">
            {/* Header */}
            <div className="p-6">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <CodeScapeLogo size={32} />
                  <div>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      CodeScapes Pro
                      {isPro && <ProBadge />}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {isPro ? "You're a Pro subscriber!" : "Unlock creative potential"}
                    </p>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <Separator />

            {/* Usage Stats Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Usage This Month
                </h3>

                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                ) : quotaStatus ? (
                  <div className="space-y-3">
                    {/* Scapper Prompts */}
                    <div className="rounded-lg border bg-background p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium">Scapper AI Prompts</span>
                        </div>
                        <span className="text-sm font-bold">
                          {isPro
                            ? "Unlimited"
                            : `${quotaStatus.prompts_used} / ${quotaStatus.prompts_limit}`}
                        </span>
                      </div>

                      {!isPro && (
                        <>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                              style={{
                                width: `${Math.min(100, (quotaStatus.prompts_used / quotaStatus.prompts_limit) * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Resets daily at midnight UTC
                          </p>
                        </>
                      )}
                    </div>

                    {/* Locked Features */}
                    <div className="opacity-70">
                      <div className="mb-2 flex items-center justify-between rounded-lg border border-dashed p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Cloud className="h-4 w-4" />
                          Cloud Scapes
                        </div>
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Rocket className="h-4 w-4" />
                          Deployments
                        </div>
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-400">Failed to load usage stats</div>
                )}
              </div>

              {/* Benefits List (moved from right side for Free users) */}
              {!isPro && (
                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Pro Benefits
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Unlimited Scapper AI prompts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Unlimited cloud scapes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Priority features & support</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Payment / Pro Status */}
          <div className="bg-background p-6 md:p-8">
            {isPro ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 rounded-full bg-emerald-500/10 p-4">
                  <ScapperIcon className="h-12 w-12 text-emerald-500" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">You are a Pro!</h2>
                <p className="mb-8 max-w-[260px] text-muted-foreground">
                  Enjoy unlimited access to all AI features and priority support.
                </p>
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="font-medium">Current Plan: $9.99/mo</p>
                  <p className="text-muted-foreground">
                    Active since {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              // Embedded Payment Form directly in the modal
              <EmbeddedPaymentForm onSuccess={fetchQuota} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
