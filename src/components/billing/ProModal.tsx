/**
 * CodeScapes Pro Modal
 *
 * For Free users: Shows "Sales Pitch" view (Usage vs Benefits), then Payment Form.
 * For Pro users: Shows a beautiful celebration/status view.
 */

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, Cloud, Rocket, Lock, CheckCircle2, X, Crown, Zap, Heart } from "lucide-react"
import { CodeScapeLogo } from "@/components/brand/Logo"
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
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  // =============================================
  // PRO USER: Beautiful Celebration View
  // =============================================
  if (isPro && !loading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg overflow-hidden border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-background p-0 sm:rounded-2xl">
          <DialogTitle className="sr-only">You are a Pro!</DialogTitle>

          {/* Golden header glow */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent" />

          <div className="relative flex flex-col items-center px-8 pb-8 pt-12 text-center">
            {/* Crown Icon with glow */}
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/20 blur-xl" />
              <div className="relative rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-5 shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20">
                <Crown className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              You're a Pro!
            </h2>
            <p className="mb-8 max-w-sm text-muted-foreground">
              Thank you for supporting CodeScapes. You have unlimited access to all premium
              features.
            </p>

            {/* Status Cards */}
            <div className="mb-8 grid w-full gap-3 sm:grid-cols-3">
              <div className="flex flex-col items-center rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <Sparkles className="mb-2 h-5 w-5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Unlimited</span>
                <span className="text-[10px] text-muted-foreground">AI Prompts</span>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <Cloud className="mb-2 h-5 w-5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Unlimited</span>
                <span className="text-[10px] text-muted-foreground">Cloud Scapes</span>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <Zap className="mb-2 h-5 w-5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Priority</span>
                <span className="text-[10px] text-muted-foreground">Support</span>
              </div>
            </div>

            {/* Plan Info */}
            <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm">
              <Heart className="h-4 w-4 text-amber-400" />
              <span className="text-muted-foreground">Active Plan:</span>
              <span className="font-semibold text-amber-400">$9.99/mo</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // =============================================
  // Payment Form Modal (after clicking Subscribe)
  // =============================================
  if (showPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-hidden p-0">
          <DialogTitle className="sr-only">Complete Payment</DialogTitle>
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

  // =============================================
  // FREE USER: Sales Pitch Modal (2-column)
  // =============================================
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
                        {quotaStatus.prompts_used} / {quotaStatus.prompts_limit}
                      </span>
                    </div>

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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
