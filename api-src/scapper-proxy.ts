import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"
import { rateLimiters } from "./lib/rateLimit"
import { isAllowedOrigin } from "./lib/security"

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

/**
 * Server-authoritative "is this a billable new prompt?" check.
 *
 * A genuine new user turn ends with a `user` message. The agent's internal
 * tool-execution loop continues the conversation by appending `assistant`
 * (tool_calls) and `tool` (results) messages, so those calls end in a non-user
 * role and are NOT billed. A client cannot pretend a real user turn is a
 * continuation without removing its own user message — which would break the
 * request it is trying to make.
 */
export function isNewUserPrompt(messages: unknown): boolean {
  if (!Array.isArray(messages) || messages.length === 0) return false
  const last = messages[messages.length - 1]
  if (!last || typeof last !== "object") return false
  return (last as { role?: unknown }).role === "user"
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

  // Check Origin for Scapper as well (since we removed the heavy auth check for OPTIONS).
  // Exact-match only; the AI panel runs in the top-level app frame so a real
  // Origin/Referer is always present (no "null"/empty allowance here).
  const origin = (req.headers.origin || req.headers.referer || "") as string
  if (!isAllowedOrigin(origin)) {
    console.warn(`Scapper Proxy blocked: unauthorized origin ${origin}`)
    return res.status(403).json({ error: "Unauthorized origin" })
  }

  // ================================================================
  // SECURITY: Rate Limiting
  // New user prompts are limited tightly (10/min); the agent's internal
  // tool-loop continuations use a much higher ceiling so multi-step builds
  // aren't throttled. "New prompt" is derived server-side (unspoofable).
  // ================================================================
  const isNewPrompt = isNewUserPrompt((req.body as RequestBody | undefined)?.messages)
  try {
    const limiter = isNewPrompt ? rateLimiters.scapperAi : rateLimiters.scapperContinuation
    const { success, limit, remaining, reset } = await limiter(req)
    res.setHeader("X-RateLimit-Limit", limit.toString())
    res.setHeader("X-RateLimit-Remaining", remaining.toString())
    res.setHeader("X-RateLimit-Reset", reset.toString())

    if (!success) {
      return res.status(429).json({
        error: "Too many requests",
        message: "AI rate limit exceeded. Please wait before sending more prompts.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      })
    }
  } catch (err) {
    // Fail open: log error but allow request to proceed
    console.error("Rate limiting error:", err)
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

    // Parse request body. NOTE: the client-supplied `promptType` is NOT trusted
    // for quota accounting — a malicious client could always send "follow_up"
    // to consume the AI budget for free. We instead derive whether this is a
    // billable user turn from the message payload itself (see isNewUserPrompt),
    // which cannot be spoofed without breaking the actual AI request.
    const body: RequestBody = req.body
    // Strip the untrusted client field before forwarding to Groq.
    const groqBody = { ...body }
    delete groqBody.promptType

    // Check quota for genuine new user prompts only (computed above, unspoofable)
    if (isNewPrompt) {
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
