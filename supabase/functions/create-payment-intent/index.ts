// @ts-nocheck - Deno Edge Function (types not available in Node/TSC)
/**
 * Create Payment Intent - Supabase Edge Function
 *
 * Creates a Stripe PaymentIntent for CodeScapes Pro subscription.
 * Uses Stripe embedded payment elements (not Checkout).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
// Downgrade to v11.18.0 to fix "runMicrotasks" error in Deno
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno&no-check"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
}

serve(async (req: Request) => {
  console.log(`[Payment] Request received: ${req.method}`)

  // Log all headers for debugging
  console.log("[Payment] Headers:")
  for (const [key, value] of req.headers.entries()) {
    console.log(`  ${key}: ${value}`)
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")

    if (!stripeSecretKey || !serviceRoleKey) {
      console.error("Missing secrets: ", {
        stripe: !!stripeSecretKey,
        serviceRole: !!serviceRoleKey,
      })
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Missing Secrets (Stripe/ServiceRole)",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Verify auth
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      console.log("[Payment] Missing Authorization header")
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      // { global: { headers: { Authorization: authHeader } } } // Deprecated approach
    )

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.replace("Bearer ", "").trim()

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.log("[Payment] Auth failed:", authError)
      return new Response(
        JSON.stringify({
          error: `Auth failed: ${authError?.message || "Unknown error"}`,
          details: authError,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }
    console.log(`[Payment] Authenticated user: ${user.id}`)

    // Stripe initialization
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    })
    console.log("[Payment] Stripe initialized")

    // Check if user already has a Stripe customer
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: quota } = await supabaseAdmin
      .from("user_quotas")
      .select("stripe_customer_id, tier")
      .eq("user_id", user.id)
      .single()

    // Already pro?
    if (quota?.tier === "pro") {
      return new Response(JSON.stringify({ error: "Already subscribed to Pro" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get or create Stripe customer
    let customerId = quota?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      // Store customer ID
      await supabaseAdmin.from("user_quotas").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
      })
      console.log(`[Payment] Created Stripe customer: ${customerId}`)
    }

    const PRICE_ID = "price_1SnTW3DReSL06oNAt9hFgqAe" // CodeScapes Pro ($9.99/mo)

    // ================================================================
    // CRITICAL: Check for existing ACTIVE subscriptions to prevent duplicates
    // ================================================================
    const existingActiveSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      price: PRICE_ID,
      limit: 1,
    })

    if (existingActiveSubscriptions.data.length > 0) {
      const existingSub = existingActiveSubscriptions.data[0]
      console.log(`[Payment] User already has active subscription: ${existingSub.id}`)
      return new Response(
        JSON.stringify({
          error: "Already subscribed",
          subscriptionId: existingSub.id,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // ================================================================
    // CRITICAL: Check for INCOMPLETE subscriptions and REUSE them
    // This prevents creating multiple subscriptions when user retries payment
    // ================================================================
    const incompleteSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "incomplete",
      limit: 5, // Get a few to find one with matching price
    })

    for (const existingSub of incompleteSubscriptions.data) {
      // Check if this subscription is for our Pro plan
      const hasProPrice = existingSub.items.data.some((item) => item.price.id === PRICE_ID)
      if (hasProPrice && existingSub.latest_invoice) {
        console.log(`[Payment] Reusing incomplete subscription: ${existingSub.id}`)

        // Retrieve the invoice with payment intent expanded
        const invoice = await stripe.invoices.retrieve(existingSub.latest_invoice as string, {
          expand: ["payment_intent"],
        })

        const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
        if (paymentIntent && paymentIntent.client_secret) {
          return new Response(
            JSON.stringify({
              subscriptionId: existingSub.id,
              clientSecret: paymentIntent.client_secret,
              reused: true, // Flag to indicate this is a reused subscription
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      }
    }

    // ================================================================
    // No existing subscription found - create a NEW one
    // ================================================================
    console.log(`[Payment] Creating new subscription for customer: ${customerId}`)

    const subscription = await stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: PRICE_ID }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: { user_id: user.id },
      },
      {
        // Idempotency key to prevent duplicate subscription creation within 1 hour
        idempotencyKey: `sub_create_${user.id}_${Math.floor(Date.now() / 3600000)}`,
      }
    )

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    console.log(`[Payment] Created subscription: ${subscription.id}`)

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Payment intent error:", error)
    return new Response(
      JSON.stringify({
        error: `Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
