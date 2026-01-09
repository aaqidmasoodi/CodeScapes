/**
 * CodeScapes Pro Modal
 *
 * Shows "Sales Pitch" view first (Usage vs Benefits),
 * then switches to Payment Form on click.
 */

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, Cloud, Rocket, Lock, CheckCircle2, X } from "lucide-react"
import { CodeScapeLogo } from "@/components/brand/Logo"
import { ScapperIcon } from "@/components/brand/ScapperIcon"
import { getQuotaStatus, type QuotaStatus } from "@/lib/quotaClient"
import { EmbeddedPaymentForm } from "@/components/billing/StripePaymentForm"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/components/theme-provider"

interface ProModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProModal({ isOpen, onClose }: ProModalProps) {
  const { user } = useAuth()
  const { resolvedTheme } = useTheme()
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)

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
    setShowPayment(false) // Reset view on open
  }, [isOpen, user])

  const isPro = quotaStatus?.tier === "pro"

  // Handle successful payment
  const handlePaymentSuccess = () => {
    fetchQuota()
    // Optional: could auto-close here or show success state
    // For now, let's keep the user on the "You are a Pro" view or close
    setTimeout(() => {
      onClose()
      // You might want to reload or update global state here
    }, 2000)
  }

  // If showing payment form, render wrapper modal
  if (showPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-hidden p-0">
          <div className="flex h-full max-h-[90vh] flex-col overflow-y-auto bg-background p-6">
            <button
              onClick={() => setShowPayment(false)}
              className="absolute right-4 top-4 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            <EmbeddedPaymentForm onSuccess={handlePaymentSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Default "Sales Pitch" Modal
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl gap-0 overflow-hidden p-0 md:h-[600px] md:w-full">
        <DialogTitle className="sr-only">Upgrade to Pro</DialogTitle>
        <div className="flex h-full flex-col overflow-y-auto md:grid md:grid-cols-2 md:overflow-hidden">
          {/* LEFT COLUMN: Features & Stats */}
          <div className="flex flex-col border-r bg-muted/20 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <CodeScapeLogo size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">CodeScapes Pro</h2>
                <p className="text-sm text-muted-foreground">Unlock creative potential</p>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 space-y-8">
              {/* Usage Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Usage This Month
                </h3>

                {loading ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : quotaStatus ? (
                  <div className="rounded-xl border bg-background/50 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium text-foreground">Scapper AI Prompts</span>
                      </div>
                      <span className="font-mono text-sm font-medium">
                        {isPro ? (
                          <span className="text-emerald-500">Unlimited</span>
                        ) : (
                          <span>
                            {quotaStatus.prompts_used} / {quotaStatus.prompts_limit}
                          </span>
                        )}
                      </span>
                    </div>

                    {!isPro && (
                      <div className="space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.min(100, (quotaStatus.prompts_used / quotaStatus.prompts_limit) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Resets daily at midnight UTC
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-red-400">Failed to load usage</div>
                )}

                {/* Locked Items */}
                <div className="space-y-2 opacity-60">
                  <div className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/30 p-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Cloud className="h-4 w-4" />
                      <span>Cloud Scapes</span>
                    </div>
                    <Lock className="h-3 w-3" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/30 p-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Rocket className="h-4 w-4" />
                      <span>Deployments</span>
                    </div>
                    <Lock className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Benefits & Action */}
          <div className="flex flex-col bg-background p-6 md:p-8">
            {isPro ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 rounded-full bg-emerald-500/10 p-6 ring-1 ring-emerald-500/20">
                  <ScapperIcon className="h-16 w-16 text-emerald-500" />
                </div>
                <h2 className="mb-2 text-2xl font-bold tracking-tight">You are a Pro!</h2>
                <div className="mx-auto mt-4 max-w-[280px] space-y-4">
                  <p className="text-muted-foreground">
                    Thank you for supporting CodeScapes. You now have unlimited access to all
                    features.
                  </p>
                  <div className="rounded-lg border bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                    Active Plan: $9.99/mo
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex-1 space-y-8">
                  {/* Benefits List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Pro Benefits
                    </h3>
                    <ul className="space-y-4">
                      {[
                        "Unlimited Scapper AI prompts",
                        "Unlimited cloud scapes",
                        "Priority features & support",
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-3 text-base">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Area */}
                <div className="mt-8 space-y-4 border-t pt-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly Plan</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight">$9.99</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className={`w-full text-base font-semibold transition-transform active:scale-[0.98] ${
                      resolvedTheme === "dark"
                        ? "bg-white text-black hover:bg-gray-100"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                    onClick={() => setShowPayment(true)}
                  >
                    Subscribe - $9.99/month
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Secured by Stripe. Cancel anytime.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
