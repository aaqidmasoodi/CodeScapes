// @ts-nocheck - Deno Edge Function (types not available in Node/TSC)
/**
 * Sync Subscription Status - Supabase Edge Function
 *
 * Syncs user's subscription status from Stripe to the database.
 * Called when we detect a mismatch (e.g., "Already subscribed" error).
 *
 * This is a recovery mechanism for when webhooks fail.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno&no-check"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
    const serviceRoleKey =
      Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!stripeSecretKey || !serviceRoleKey) {
      console.error("[Sync] Missing secrets")
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Verify auth
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    )

    const token = authHeader.replace("Bearer ", "").trim()
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Auth failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    console.log(`[Sync] Checking Stripe for user ${user.id}`)

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get user's quota record to find their Stripe customer ID
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: quota } = await supabaseAdmin
      .from("user_quotas")
      .select("stripe_customer_id, tier")
      .eq("user_id", user.id)
      .single()

    if (!quota?.stripe_customer_id) {
      console.log("[Sync] No Stripe customer ID found for user")
      return new Response(
        JSON.stringify({
          synced: false,
          tier: quota?.tier || "free",
          message: "No Stripe customer found",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Check for any active subscriptions in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: quota.stripe_customer_id,
      status: "active",
      limit: 1,
    })

    if (subscriptions.data.length > 0) {
      const activeSub = subscriptions.data[0]
      console.log(`[Sync] Found active subscription: ${activeSub.id}`)

      // User has active subscription - upgrade to pro if not already
      if (quota.tier !== "pro") {
        console.log(`[Sync] Syncing tier to 'pro' for user ${user.id}`)

        const { error: updateError } = await supabaseAdmin.rpc("upgrade_to_pro", {
          p_user_id: user.id,
          p_stripe_customer_id: quota.stripe_customer_id,
          p_stripe_subscription_id: activeSub.id,
        })

        if (updateError) {
          console.error("[Sync] Failed to upgrade:", updateError)
          return new Response(
            JSON.stringify({
              synced: false,
              error: updateError.message,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          )
        }

        return new Response(
          JSON.stringify({
            synced: true,
            tier: "pro",
            subscriptionId: activeSub.id,
            message: "Successfully synced to Pro",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      } else {
        return new Response(
          JSON.stringify({
            synced: false,
            tier: "pro",
            message: "Already Pro in database",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }
    } else {
      console.log("[Sync] No active subscriptions found in Stripe")
      return new Response(
        JSON.stringify({
          synced: false,
          tier: quota.tier,
          message: "No active subscription in Stripe",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }
  } catch (error) {
    console.error("[Sync] Error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Sync failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
