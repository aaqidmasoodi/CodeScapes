/**
 * Quota Client - Scapper Usage Tracking
 *
 * Client-side utilities for quota management and prompt type classification.
 *
 * COUNTING LOGIC:
 * - Every NEW USER REQUEST counts (even in an ongoing conversation)
 * - ONLY responses to Scapper's questions are FREE:
 *   - Plan approvals ("[PLAN_APPROVED]", "yes" after plan proposal)
 *   - Clarification responses (answering ask_user questions)
 *   - Responses to "Would you like me to..." type questions
 */

import { supabase } from "./supabase"
import type { GroqMessage } from "./ai/groqClient"

// Prompt types for quota tracking
export type PromptType = "new_prompt" | "scapper_response"

// Quota status from database
export interface QuotaStatus {
  prompts_used: number
  prompts_limit: number // -1 = unlimited (pro)
  tier: "free" | "pro"
  resets_at: string | null
}

/**
 * Get current quota status for the logged-in user
 */
export async function getQuotaStatus(): Promise<QuotaStatus | null> {
  const { data, error } = await supabase.rpc("get_quota_status")

  if (error) {
    console.error("[Quota] Failed to get status:", error)
    return null
  }

  return data as QuotaStatus
}

/**
 * Check if user can send a new prompt (without incrementing)
 */
export async function checkCanSendPrompt(): Promise<{
  allowed: boolean
  status: QuotaStatus | null
}> {
  const status = await getQuotaStatus()

  if (!status) {
    return { allowed: false, status: null }
  }

  // Pro tier is always allowed
  if (status.tier === "pro" || status.prompts_limit === -1) {
    return { allowed: true, status }
  }

  // Check if under limit
  return {
    allowed: status.prompts_used < status.prompts_limit,
    status,
  }
}

/**
 * Detect if Scapper just asked a question that the user might be responding to
 *
 * Checks the last assistant message for question patterns like:
 * - "Would you like me to...?"
 * - "Should I...?"
 * - "Do you want me to...?"
 * - "[PLAN_PROPOSAL]"
 * - Questions ending with "?"
 */
function isScapperAskingQuestion(conversationHistory: GroqMessage[]): boolean {
  if (conversationHistory.length === 0) return false

  // Find the last assistant message
  const lastAssistantMsg = [...conversationHistory].reverse().find((m) => m.role === "assistant")

  if (!lastAssistantMsg?.content) return false

  const content = lastAssistantMsg.content.toLowerCase()

  // Check for plan proposal
  if (lastAssistantMsg.content.includes("[PLAN_PROPOSAL]")) {
    return true
  }

  // Check for common question patterns
  const questionPatterns = [
    "would you like me to",
    "would you like to",
    "should i ",
    "do you want me to",
    "do you want to",
    "shall i ",
    "can i ",
    "may i ",
    "would you prefer",
    "which would you",
    "what would you",
    "how would you",
    "let me know if",
    "would that work",
    "is that okay",
    "is that correct",
    "does that look",
    "does that sound",
  ]

  return questionPatterns.some((pattern) => content.includes(pattern))
}

/**
 * Check if user message is a simple response to Scapper's question
 * (yes/no, approval, short confirmations)
 */
function isSimpleResponse(message: string): boolean {
  const trimmed = message.trim().toLowerCase()

  // Plan approval patterns
  if (message.startsWith("[PLAN_APPROVED]")) return true
  if (trimmed.includes("plan cancelled")) return true

  // Simple confirmations
  const simpleResponses = [
    "yes",
    "no",
    "yeah",
    "nope",
    "yep",
    "nah",
    "sure",
    "okay",
    "ok",
    "proceed",
    "go ahead",
    "approve",
    "approved",
    "cancel",
    "reject",
    "sounds good",
    "looks good",
    "that works",
    "do it",
    "go for it",
    "please do",
    "no thanks",
    "not now",
    "maybe later",
    "run it",
    "test it",
    "try it",
  ]

  return simpleResponses.some((r) => trimmed === r || trimmed === r + "!")
}

/**
 * Classify a user message into a prompt type for quota tracking
 *
 * @param message - The user's message
 * @param conversationHistory - Current conversation history
 * @param isAnsweringQuestion - Whether user is answering a Scapper clarification (ask_user)
 */
export function classifyPromptType(
  message: string,
  conversationHistory: GroqMessage[],
  isAnsweringQuestion: boolean = false
): PromptType {
  // If this is a response to Scapper's ask_user question (from agent)
  if (isAnsweringQuestion) {
    console.log("[Quota] Classified as: scapper_response (answering ask_user)")
    return "scapper_response"
  }

  // Check if Scapper just asked a question AND user is giving a simple response
  if (isScapperAskingQuestion(conversationHistory) && isSimpleResponse(message)) {
    console.log("[Quota] Classified as: scapper_response (responding to Scapper's question)")
    return "scapper_response"
  }

  // Everything else is a new prompt that counts
  console.log("[Quota] Classified as: new_prompt (user request)")
  return "new_prompt"
}

/**
 * Format remaining prompts for display
 */
export function formatQuotaDisplay(status: QuotaStatus): string {
  if (status.tier === "pro" || status.prompts_limit === -1) {
    return "Unlimited"
  }

  const remaining = Math.max(0, status.prompts_limit - status.prompts_used)
  return `${remaining}/${status.prompts_limit} prompts left today`
}

/**
 * Check if quota is exhausted
 */
export function isQuotaExhausted(status: QuotaStatus): boolean {
  if (status.tier === "pro" || status.prompts_limit === -1) {
    return false
  }
  return status.prompts_used >= status.prompts_limit
}
