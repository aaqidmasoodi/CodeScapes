/**
 * CodeScapes Pro Modal
 *
 * Shows subscription tier, usage stats, and upgrade option.
 * Opens from sidebar activity bar.
 */

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Zap, Cloud, Rocket } from "lucide-react"
import { CodeScapeLogo } from "@/components/brand/Logo"
import { ProBadge } from "@/components/brand/ScapperIcon"
import { getQuotaStatus, type QuotaStatus } from "@/lib/quotaClient"
import { UpgradeModal } from "@/components/billing/StripePaymentForm"
import { useAuth } from "@/hooks/useAuth"

interface ProModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProModal({ isOpen, onClose }: ProModalProps) {
  const { user } = useAuth()
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  // Fetch quota status when modal opens
  useEffect(() => {
    if (!isOpen || !user) return

    const fetchQuota = async () => {
      try {
        const status = await getQuotaStatus()
        setQuotaStatus(status)
      } catch (e) {
        console.error("Failed to fetch quota:", e)
      }
    }

    fetchQuota()
  }, [isOpen, user])

  const isPro = quotaStatus?.tier === "pro"

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-6">
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CodeScapeLogo size={40} />
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      CodeScapes Pro
                      {isPro && <ProBadge />}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {isPro ? "You're a Pro subscriber!" : "Unlock unlimited creative potential"}
                    </p>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-6">
            {/* Current Plan */}
            <div>
              <h3 className="mb-3 text-sm font-medium">Current Plan</h3>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${isPro ? "bg-emerald-500/20" : "bg-muted"}`}>
                    <CodeScapeLogo size={24} />
                  </div>
                  <div>
                    <p className="font-medium">{isPro ? "Pro Plan" : "Free Plan"}</p>
                    <p className="text-xs text-muted-foreground">
                      {isPro ? "$9.99/month" : "Limited features"}
                    </p>
                  </div>
                </div>
                {isPro && <ProBadge />}
              </div>
            </div>

            <Separator />

            {/* Usage Stats */}
            {quotaStatus && (
              <div>
                <h3 className="mb-3 text-sm font-medium">Usage</h3>
                <div className="space-y-3">
                  {/* Scapper Prompts */}
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Scapper AI Prompts</span>
                      </div>
                      <span className="text-sm font-medium">
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

                  {/* Coming Soon: Cloud Scapes */}
                  <div className="rounded-lg border border-dashed p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Cloud Scapes</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Coming soon</span>
                    </div>
                  </div>

                  {/* Coming Soon: Deploys */}
                  <div className="rounded-lg border border-dashed p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Deploys</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Coming soon</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Section - Free users only */}
            {!isPro && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-3 text-sm font-medium">Upgrade to Pro</h3>
                  <div className="space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        Unlimited Scapper AI prompts
                      </li>
                      <li className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-emerald-500" />
                        Unlimited cloud scapes
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-emerald-500" />
                        Priority features & support
                      </li>
                    </ul>
                    <Button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      Upgrade to Pro - $9.99/month
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Pro user thanks */}
            {isPro && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Thank you for supporting CodeScapes! ✨</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={() => {
          getQuotaStatus().then(setQuotaStatus)
          setUpgradeModalOpen(false)
        }}
      />
    </>
  )
}
