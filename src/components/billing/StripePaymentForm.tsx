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

export function EmbeddedPaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseAnonKey) {
          throw new Error("Missing Supabase Anon Key configuration")
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: supabaseAnonKey,
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (!response.ok) {
          const errorMessage = data.error || data.message || "Failed to initialize payment"
          throw new Error(errorMessage)
        }

        setClientSecret(data.clientSecret)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment initialization failed")
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-6 text-center">
        <XCircle className="mb-4 h-12 w-12 text-red-500" />
        <h3 className="text-lg font-medium text-red-500">Initialization Failed</h3>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-xs underline hover:text-foreground"
        >
          Reload page to try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Upgrade to Pro</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get unlimited Scapper AI prompts for $9.99/month
        </p>
      </div>

      <div className="flex-1">
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
                  spacingUnit: "4px",
                },
              },
            }}
          >
            <CheckoutForm onSuccess={onSuccess} />
          </Elements>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <CreditCard className="h-3 w-3" />
        <span>Secured by Stripe. Cancel anytime.</span>
      </div>
    </div>
  )
}

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
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
