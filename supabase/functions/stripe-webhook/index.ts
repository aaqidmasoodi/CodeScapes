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
      console.error("[Webhook] Stripe keys not configured:", {
        hasSecretKey: !!stripeSecretKey,
        hasWebhookSecret: !!stripeWebhookSecret,
      })
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // DEBUG: Log secret prefix to verify correct value is loaded
    console.log("[Webhook] Secrets loaded:", {
      secretKeyPrefix: stripeSecretKey.substring(0, 10) + "...",
      webhookSecretPrefix: stripeWebhookSecret.substring(0, 12) + "...",
    })

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
      // IMPORTANT: Use constructEventAsync for Deno compatibility
      // The synchronous constructEvent doesn't work in Deno's async crypto context
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret)
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err)
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
      // ================================================================
      // PRIMARY UPGRADE PATH: invoice.paid
      // This is the MOST RELIABLE event - fires AFTER payment succeeds
      // ================================================================
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Webhook] Invoice paid: ${invoice.id}, subscription: ${invoice.subscription}`)

        // Only process subscription invoices (not one-time payments)
        if (!invoice.subscription) {
          console.log("[Webhook] Not a subscription invoice, skipping")
          break
        }

        // Retrieve the subscription to get user_id from metadata
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const userId = subscription.metadata?.user_id

        console.log(`[Webhook] Subscription ${subscription.id} status: ${subscription.status}`)
        console.log(`[Webhook] Subscription metadata:`, subscription.metadata)

        if (!userId) {
          console.error("[Webhook] No user_id in subscription metadata - cannot upgrade")
          break
        }

        // Now we KNOW payment succeeded, upgrade the user!
        if (subscription.status === "active") {
          console.log(`[Webhook] ✅ Upgrading user ${userId} to Pro (invoice.paid)...`)
          const { error, data } = await supabaseAdmin.rpc("upgrade_to_pro", {
            p_user_id: userId,
            p_stripe_customer_id: subscription.customer as string,
            p_stripe_subscription_id: subscription.id,
          })

          if (error) {
            console.error("[Webhook] ❌ Failed to upgrade user:", error)
          } else {
            console.log(`[Webhook] ✅ Successfully upgraded user ${userId} to Pro!`, data)
          }
        } else {
          console.log(`[Webhook] Subscription not active yet (${subscription.status}), waiting...`)
        }
        break
      }

      // ================================================================
      // BACKUP PATH: subscription.updated (in case invoice.paid doesn't fire)
      // ================================================================
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(
          `[Webhook] Subscription updated: ${subscription.id}, status: ${subscription.status}`
        )

        // Only process if subscription just became active
        if (subscription.status !== "active") {
          console.log(`[Webhook] Status is ${subscription.status}, not upgrading yet`)
          break
        }

        const userId = subscription.metadata?.user_id
        if (!userId) {
          console.error("[Webhook] No user_id in subscription metadata")
          break
        }

        // Check if already upgraded (idempotency)
        const { data: existingQuota } = await supabaseAdmin
          .from("user_quotas")
          .select("tier")
          .eq("user_id", userId)
          .single()

        if (existingQuota?.tier === "pro") {
          console.log(`[Webhook] User ${userId} already Pro, skipping`)
          break
        }

        console.log(`[Webhook] ✅ Upgrading user ${userId} to Pro (subscription.updated)...`)
        const { error } = await supabaseAdmin.rpc("upgrade_to_pro", {
          p_user_id: userId,
          p_stripe_customer_id: subscription.customer as string,
          p_stripe_subscription_id: subscription.id,
        })

        if (error) {
          console.error("[Webhook] ❌ Failed to upgrade user:", error)
        } else {
          console.log(`[Webhook] ✅ Successfully upgraded user ${userId} to Pro!`)
        }
        break
      }

      // ================================================================
      // DOWNGRADE: subscription deleted/cancelled
      // ================================================================
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) {
          console.error("[Webhook] No user_id in subscription metadata")
          break
        }

        console.log(`[Webhook] Downgrading user ${userId} to Free...`)
        const { error } = await supabaseAdmin.rpc("downgrade_to_free", {
          p_user_id: userId,
        })

        if (error) {
          console.error("[Webhook] ❌ Failed to downgrade user:", error)
        } else {
          console.log(`[Webhook] ✅ Downgraded user ${userId} to Free`)
        }
        break
      }

      // ================================================================
      // LOGGING ONLY: subscription created (don't upgrade here!)
      // ================================================================
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(
          `[Webhook] Subscription created: ${subscription.id}, status: ${subscription.status}`
        )
        console.log("[Webhook] Waiting for invoice.paid event to confirm payment...")
        // DO NOT upgrade here - status is likely "incomplete"
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Webhook] ❌ Payment failed for invoice ${invoice.id}`)
        // Could implement grace period or notification logic here
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
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
