import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"

/**
 * Scapper AI Proxy - Vercel Edge Function
 *
 * Server-side proxy for Groq API calls with quota enforcement.
 * Uses Vercel for higher invocation limits (1M vs Supabase's 500K).
 *
 * Flow:
 * 1. Validate Supabase JWT
 * 2. Check/increment quota via Supabase RPC (for new_prompt only)
 * 3. Forward request to Groq API
 */

// Prompt types that don't count against quota
type PromptType = "new_prompt" | "follow_up" | "plan_approval" | "clarification_response"

interface RequestBody {
  messages: unknown[]
  tools?: unknown[]
  model?: string
  temperature?: number
  max_completion_tokens?: number
  reasoning_effort?: string
  stream?: boolean
  promptType?: PromptType
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" })
    }

    const accessToken = authHeader.replace("Bearer ", "")

    // Create Supabase client with user's JWT
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase config missing")
      return res.status(500).json({ error: "Server configuration error" })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Parse request body
    const body: RequestBody = req.body
    const { promptType = "follow_up", ...groqBody } = body

    // Check quota for new prompts only
    if (promptType === "new_prompt") {
      const { data: quotaResult, error: quotaError } = await supabase.rpc(
        "check_and_increment_quota"
      )

      if (quotaError) {
        console.error("Quota check error:", quotaError)
        return res.status(500).json({ error: "Failed to check quota" })
      }

      if (!quotaResult.allowed) {
        return res.status(429).json({
          error: "quota_exceeded",
          message: quotaResult.message || "Daily prompt limit reached",
          prompts_used: quotaResult.prompts_used,
          prompts_limit: quotaResult.prompts_limit,
          tier: quotaResult.tier,
        })
      }
    }

    // Get Groq API key from environment
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      console.error("GROQ_API_KEY not configured")
      return res.status(500).json({ error: "AI service not configured" })
    }

    // Forward request to Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqBody),
    })

    // Handle streaming responses
    if (body.stream && groqResponse.body) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")

      const reader = groqResponse.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          res.write(chunk)
        }
        res.end()
      } catch (streamError) {
        console.error("Stream error:", streamError)
        res.end()
      }
      return
    }

    // Handle non-streaming responses
    const groqData = await groqResponse.json()
    return res.status(groqResponse.status).json(groqData)
  } catch (error) {
    console.error("Scapper proxy error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
