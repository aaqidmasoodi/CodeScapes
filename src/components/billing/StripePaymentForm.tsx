/**
 * Stripe Payment Form - Embedded Elements
 *
 * Uses Stripe Elements for an embedded payment form (not Checkout redirect).
 */

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "")

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UpgradeModal({ isOpen, onClose, onSuccess }: UpgradeModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const createPaymentIntent = async () => {
      setLoading(true)
      setError(null)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          setError("Please sign in to upgrade")
          return
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to initialize payment")
        }

        setClientSecret(data.clientSecret)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment initialization failed")
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <XCircle className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">Upgrade to Pro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get unlimited Scapper AI prompts for $9.99/month
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#10b981",
                  colorBackground: "#1a1a1a",
                  colorText: "#ffffff",
                  colorDanger: "#ef4444",
                  fontFamily: "system-ui, sans-serif",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        )}

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>Secured by Stripe. Cancel anytime.</span>
        </div>
      </div>
    </div>
  )
}

function CheckoutForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    try {
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard?upgraded=true",
        },
        redirect: "if_required",
      })

      if (paymentError) {
        setError(paymentError.message || "Payment failed")
      } else {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle className="mb-4 h-12 w-12 text-emerald-500" />
        <p className="text-lg font-medium">Welcome to Pro!</p>
        <p className="text-sm text-muted-foreground">Enjoy unlimited Scapper prompts</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Subscribe - $9.99/month"
        )}
      </button>
    </form>
  )
}
