/**
 * Groq API Client for Scapper AI Agent
 *
 * Routes through Vercel Edge Function for server-side API key security
 * and quota enforcement. Uses Vercel for higher invocation limits.
 */

import { supabase } from "../supabase"
import type { PromptType } from "../quotaClient"

// Vercel API route for Groq proxy (higher free tier than Supabase Edge Functions)
const SCAPPER_PROXY_URL = "/api/scapper-proxy"

// Types
export interface GroqMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_call_id?: string
  tool_calls?: GroqToolCall[]
}

export interface GroqToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string // JSON string
  }
}

export interface GroqTool {
  type: "function"
  function: {
    name: string
    description: string
    parameters: {
      type: "object"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: Record<string, any>
      required: string[]
    }
  }
}

export interface GroqResponse {
  id: string
  choices: {
    message: {
      role: "assistant"
      content: string | null
      tool_calls?: GroqToolCall[]
    }
    finish_reason: "stop" | "tool_calls" | "length"
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Error class
export class GroqAPIError extends Error {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = "GroqAPIError"
    this.status = status
    this.code = code
  }
}

// Main client
export async function chatCompletion(
  messages: GroqMessage[],
  tools?: GroqTool[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    reasoning_effort?: "low" | "medium" | "high"
    signal?: AbortSignal
    promptType?: PromptType // For quota tracking
  }
): Promise<GroqResponse> {
  // Get user's access token for auth
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const accessToken = session?.access_token

  if (!accessToken) {
    throw new GroqAPIError(
      "Authentication required. Please sign in to use Scapper.",
      401,
      "auth_required"
    )
  }

  const {
    model = "openai/gpt-oss-120b",
    maxTokens,
    temperature = 0.6,
    reasoning_effort = "medium",
    promptType = "follow_up",
  } = options || {}

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    reasoning_effort,
    promptType, // Pass to Edge Function for quota check
  }

  if (maxTokens) {
    body.max_completion_tokens = maxTokens
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = "auto"
  }

  // Retry logic with exponential backoff
  const MAX_RETRIES = 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Add delay between attempts
      if (attempt > 0) {
        const delay = Math.min(5000 * Math.pow(2, attempt), 30000)
        await sleep(delay)
      }

      const response = await fetch(SCAPPER_PROXY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: options?.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[Scapper Proxy Error]", response.status, errorData)

        // Handle quota exceeded - don't retry, throw immediately
        if (response.status === 429 && errorData.error === "quota_exceeded") {
          throw new GroqAPIError(
            errorData.message ||
              "Daily prompt limit reached. Upgrade to Pro for unlimited prompts.",
            429,
            "quota_exceeded"
          )
        }

        // Check if rate limited or server error (retryable)
        if (response.status === 429 || response.status >= 500) {
          const isRateLimit = response.status === 429
          console.log(
            `[Scapper] ${isRateLimit ? "Rate limited" : "Server error"}, waiting before retry...`
          )

          lastError = new GroqAPIError(
            isRateLimit ? "Rate limited - waiting before retry..." : "Server error - retrying...",
            response.status,
            isRateLimit ? "rate_limit" : "server_error"
          )
          continue
        }

        throw new GroqAPIError(
          errorData.error?.message || `API error: ${response.status}`,
          response.status,
          errorData.error?.code
        )
      }

      const data: GroqResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof GroqAPIError && error.code === "quota_exceeded") {
        throw error // Don't retry quota errors
      }
      if (error instanceof GroqAPIError && error.status !== 429 && (error.status ?? 0) < 500) {
        throw error // Don't retry non-retryable errors
      }
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  // All retries exhausted
  throw (
    lastError ||
    new GroqAPIError(
      `Request failed after ${MAX_RETRIES} retries. Please try again.`,
      500,
      "max_retries_exceeded"
    )
  )
}

/**
 * Streaming result from chat completion
 */
export interface StreamChunk {
  type: "token" | "reasoning" | "tool_call" | "done" | "error"
  content?: string
  toolCalls?: GroqToolCall[]
  error?: string
  usage?: GroqResponse["usage"]
}

/**
 * Streaming chat completion - yields tokens as they arrive
 */
export async function* chatCompletionStream(
  messages: GroqMessage[],
  tools?: GroqTool[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    signal?: AbortSignal
    promptType?: PromptType
  }
): AsyncGenerator<StreamChunk, void, unknown> {
  // Get user's access token for auth
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const accessToken = session?.access_token

  if (!accessToken) {
    yield {
      type: "error",
      error: "Authentication required. Please sign in to use Scapper.",
    }
    return
  }

  const {
    model = "openai/gpt-oss-120b",
    maxTokens = 4096,
    temperature = 0.6,
    promptType = "follow_up",
  } = options || {}

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
    stream: true,
    promptType,
  }

  if (maxTokens) {
    body.max_completion_tokens = maxTokens
  }

  if (tools && tools.length > 0) {
    body.tools = tools
    body.tool_choice = "auto"
  }

  try {
    const response = await fetch(SCAPPER_PROXY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: options?.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Handle quota exceeded
      if (response.status === 429 && errorData.error === "quota_exceeded") {
        yield {
          type: "error",
          error:
            errorData.message ||
            "Daily prompt limit reached. Upgrade to Pro for unlimited prompts.",
        }
        return
      }

      yield {
        type: "error",
        error: errorData.error?.message || `API error: ${response.status}`,
      }
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      yield { type: "error", error: "No response body" }
      return
    }

    const decoder = new TextDecoder()
    let buffer = ""
    const toolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map()
    let fullContent = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE events
      const lines = buffer.split("\n")
      buffer = lines.pop() || "" // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const data = line.slice(6).trim()

        if (data === "[DONE]") {
          // Stream complete
          if (toolCalls.size > 0) {
            const calls: GroqToolCall[] = Array.from(toolCalls.values()).map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments },
            }))
            yield { type: "tool_call", toolCalls: calls }
          }
          yield { type: "done", content: fullContent }
          return
        }

        try {
          const parsed = JSON.parse(data)

          // Check for error in stream
          if (parsed.error) {
            yield { type: "error", error: parsed.error.message }
            return
          }

          const delta = parsed.choices?.[0]?.delta

          // Handle both content and reasoning tokens
          if (delta?.content) {
            fullContent += delta.content
            yield { type: "token", content: delta.content }
          }

          // Yield reasoning tokens separately for UI display
          if (delta?.reasoning) {
            yield { type: "reasoning", content: delta.reasoning }
          }

          // Handle streaming tool calls
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0
              if (!toolCalls.has(idx)) {
                toolCalls.set(idx, { id: tc.id || "", name: "", arguments: "" })
              }
              const existing = toolCalls.get(idx)!
              if (tc.id) existing.id = tc.id
              if (tc.function?.name) existing.name = tc.function.name
              if (tc.function?.arguments) existing.arguments += tc.function.arguments
            }
          }

          // Check for finish reason
          if (parsed.choices?.[0]?.finish_reason === "tool_calls" && toolCalls.size > 0) {
            const calls: GroqToolCall[] = Array.from(toolCalls.values()).map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments },
            }))
            yield { type: "tool_call", toolCalls: calls }
          }

          // Extract usage if present
          if (parsed.usage) {
            yield { type: "done", content: fullContent, usage: parsed.usage }
            return
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }

    // Final yield if we exit normally
    if (toolCalls.size > 0) {
      const calls: GroqToolCall[] = Array.from(toolCalls.values()).map((tc) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.name, arguments: tc.arguments },
      }))
      yield { type: "tool_call", toolCalls: calls }
    }
    yield { type: "done", content: fullContent }
  } catch (error) {
    yield {
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Helper for delays
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Parse tool call arguments safely
 */
export function parseToolArguments<T>(toolCall: GroqToolCall): T {
  try {
    return JSON.parse(toolCall.function.arguments) as T
  } catch {
    throw new Error(`Failed to parse tool arguments: ${toolCall.function.arguments}`)
  }
}
