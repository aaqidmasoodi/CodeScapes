/**
 * Create Payment Intent - Supabase Edge Function
 *
 * Creates a Stripe PaymentIntent for CodeScapes Pro subscription.
 * Uses Stripe embedded payment elements (not Checkout).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
// import Stripe from "https://esm.sh/stripe@12.4.0?target=deno"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Pro subscription price (in cents)
// const PRO_PRICE_MONTHLY = 999 // $9.99/month

serve(async (req: Request) => {
  console.log(`[Payment] Request received: ${req.method}`)
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

    // --- DEBUG: BYPASS STRIPE ---
    /*
    // Stripe initialization
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    })
    console.log("[Payment] Stripe initialized")

    // ... (rest of stripe logic commented out) ...
    */

    console.log("[Payment] Returning mock success (Debug Mode)")
    return new Response(
      JSON.stringify({
        subscriptionId: "sub_mock_debug_123",
        clientSecret: "pi_mock_secret_123",
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
