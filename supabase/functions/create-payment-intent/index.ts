/**
 * Create Payment Intent - Supabase Edge Function
 *
 * Creates a Stripe PaymentIntent for CodeScapes Pro subscription.
 * Uses Stripe embedded payment elements (not Checkout).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
}

// Pro subscription price (in cents)
const PRO_PRICE_MONTHLY = 999 // $9.99/month

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
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.log("[Payment] Auth failed:", authError)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
    console.log(`[Payment] Authenticated user: ${user.id}`)

    // Stripe initialization
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    })
    console.log("[Payment] Stripe initialized")

    // Check if user already has a Stripe customer
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

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
    }

    // Create subscription with payment
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "CodeScapes Pro",
              description: "Unlimited Scapper AI prompts",
            },
            unit_amount: PRO_PRICE_MONTHLY,
            recurring: { interval: "month" },
          },
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { user_id: user.id },
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Payment intent error:", error)
    return new Response(JSON.stringify({ error: "Failed to create payment" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
