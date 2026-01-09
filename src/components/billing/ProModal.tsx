/**
 * CodeScapes Pro Modal
 *
 * For Free users: Shows "Sales Pitch" view (Usage vs Benefits), then Payment Form.
 * For Pro users: Shows a clean celebration/status view.
 *
 * Uses proper loading states to prevent flashing between views.
 */

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Cloud, Rocket, Lock, CheckCircle2, Crown, Zap, Heart } from "lucide-react"
import { CodeScapeLogo } from "@/components/brand/Logo"
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
  // LOGGED OUT: Marketing-only view with sign-in CTA
  // =============================================
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="sr-only">CodeScapes Pro</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-6 text-center">
            {/* Logo */}
            <div className="mb-4 rounded-lg bg-primary/10 p-3">
              <CodeScapeLogo size={40} />
            </div>

            <h2 className="mb-2 text-2xl font-bold tracking-tight">CodeScapes Pro</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Unlock the full potential of your coding creativity
            </p>

            {/* Benefits */}
            <div className="mb-6 flex flex-col items-start space-y-3">
              {[
                { icon: Sparkles, text: "Unlimited Scapper prompts" },
                { icon: Cloud, text: "Unlimited cloud scapes" },
                { icon: Zap, text: "Priority features & support" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            <Separator className="mb-6" />

            {/* Pricing */}
            <div className="mb-4">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            {/* Sign in CTA */}
            <Button className="w-full" size="lg" asChild>
              <Link to="/login">Sign In to Get Pro</Link>
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Already on CodeScapes Pro?{" "}
              <Link to="/login" className="underline hover:text-foreground">
                Sign in
              </Link>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // =============================================
  // LOADING STATE: Show skeleton while determining user status
  // This prevents the flash between views
  // =============================================
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
            <div className="mt-4 grid w-full grid-cols-3 gap-3">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // =============================================
  // PRO USER: Clean Status View
  // =============================================
  if (isPro) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="sr-only">You are a Pro!</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-6 text-center">
            {/* Crown Icon */}
            <div className="mb-6 rounded-full bg-primary/10 p-4">
              <Crown className="h-10 w-10 text-primary" />
            </div>

            {/* Title */}
            <h2 className="mb-2 text-2xl font-bold tracking-tight">You're a Pro!</h2>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Thank you for supporting CodeScapes. You have unlimited access to all premium
              features.
            </p>

            {/* Status Cards */}
            <div className="mb-6 grid w-full grid-cols-3 gap-3">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col items-center p-4">
                  <Sparkles className="mb-2 h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Unlimited</span>
                  <span className="text-[10px] text-muted-foreground">AI Prompts</span>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col items-center p-4">
                  <Cloud className="mb-2 h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Unlimited</span>
                  <span className="text-[10px] text-muted-foreground">Cloud Scapes</span>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col items-center p-4">
                  <Zap className="mb-2 h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Priority</span>
                  <span className="text-[10px] text-muted-foreground">Support</span>
                </CardContent>
              </Card>
            </div>

            {/* Plan Info */}
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <Heart className="h-3 w-3" />
              Active Plan: $9.99/mo
            </Badge>
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
          <DialogHeader className="sr-only">
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="flex h-full max-h-[90vh] flex-col overflow-y-auto p-6">
            {/* Back button to return to sales pitch */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4 text-xs text-muted-foreground"
              onClick={() => setShowPayment(false)}
            >
              ← Back
            </Button>
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
        <DialogHeader className="sr-only">
          <DialogTitle>Upgrade to CodeScapes Pro</DialogTitle>
          <DialogDescription>Unlock unlimited AI prompts and cloud scapes</DialogDescription>
        </DialogHeader>

        <div className="flex h-full flex-col overflow-y-auto md:grid md:grid-cols-2 md:overflow-hidden">
          {/* LEFT COLUMN: Features & Stats */}
          <div className="flex flex-col border-r bg-muted/30 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CodeScapeLogo size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">CodeScapes Pro</h2>
                <p className="text-sm text-muted-foreground">Unlock creative potential</p>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 space-y-6">
              {/* Usage Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Usage This Month
                </h3>

                {quotaStatus ? (
                  <Card>
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-medium">Scapper AI Prompts</span>
                        </div>
                        <span className="font-mono text-sm">
                          {quotaStatus.prompts_used} / {quotaStatus.prompts_limit}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.min(100, (quotaStatus.prompts_used / quotaStatus.prompts_limit) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Resets daily at midnight UTC
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {/* Locked Items */}
                <div className="space-y-2 opacity-60">
                  <Card className="border-dashed">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Cloud className="h-4 w-4" />
                        <span>Cloud Scapes</span>
                      </div>
                      <Lock className="h-3 w-3" />
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Rocket className="h-4 w-4" />
                        <span>Deployments</span>
                      </div>
                      <Lock className="h-3 w-3" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Benefits & Action */}
          <div className="flex flex-col p-6 md:p-8">
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-6">
                {/* Benefits List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pro Benefits
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Unlimited Scapper AI prompts",
                      "Unlimited cloud scapes",
                      "Priority features & support",
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-6 space-y-4">
                <Separator />
                <div className="flex items-end justify-between pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Plan</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">$9.99</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={() => setShowPayment(true)}>
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
