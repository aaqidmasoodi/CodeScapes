/**
 * Stripe Webhook Handler - Supabase Edge Function
 *
 * Handles subscription lifecycle events for CodeScapes Pro.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
// Use same stable Stripe version as create-payment-intent for Deno compatibility
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno&no-check"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

    if (!stripeSecretKey || !stripeWebhookSecret) {
      console.error("Stripe keys not configured")
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    })
    console.log("[Webhook] Stripe initialized")

    // Verify webhook signature
    const signature = req.headers.get("stripe-signature")
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const body = await req.text()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    console.log(`[Webhook] Event received: ${event.type}`)

    // Create Supabase admin client for database updates
    // Try both possible secret names for compatibility
    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")
    if (!serviceRoleKey) {
      console.error("[Webhook] Missing SERVICE_ROLE_KEY")
      return new Response(JSON.stringify({ error: "Missing service role key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Handle subscription events
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(
          `[Webhook] Processing subscription: ${subscription.id}, status: ${subscription.status}`
        )
        console.log(`[Webhook] Subscription metadata:`, subscription.metadata)

        // Get user ID from subscription metadata
        const userId = subscription.metadata?.user_id
        if (!userId) {
          console.error("[Webhook] No user_id in subscription metadata - cannot upgrade")
          break
        }

        // Only upgrade if subscription is active
        if (subscription.status === "active" || subscription.status === "trialing") {
          console.log(`[Webhook] Upgrading user ${userId} to Pro...`)
          const { error, data } = await supabaseAdmin.rpc("upgrade_to_pro", {
            p_user_id: userId,
            p_stripe_customer_id: subscription.customer as string,
            p_stripe_subscription_id: subscription.id,
          })

          if (error) {
            console.error("[Webhook] Failed to upgrade user:", error)
          } else {
            console.log(`[Webhook] Successfully upgraded user ${userId} to Pro. Result:`, data)
          }
        } else {
          console.log(`[Webhook] Subscription status is ${subscription.status}, not upgrading yet`)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) {
          console.error("No user_id in subscription metadata")
          break
        }

        const { error } = await supabaseAdmin.rpc("downgrade_to_free", {
          p_user_id: userId,
        })

        if (error) {
          console.error("Failed to downgrade user:", error)
        } else {
          console.log(`Downgraded user ${userId} to Free`)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Payment failed for invoice ${invoice.id}`)
        // Could implement grace period logic here
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
