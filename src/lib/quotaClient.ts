/**
 * Quota Client - Scapper Usage Tracking
 *
 * Client-side utilities for quota management and prompt type classification.
 */

import { supabase } from "./supabase"
import type { GroqMessage } from "./ai/groqClient"

// Prompt types for quota tracking
export type PromptType = "new_prompt" | "follow_up" | "plan_approval" | "clarification_response"

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
 * Classify a user message into a prompt type for quota tracking
 *
 * @param message - The user's message
 * @param conversationHistory - Current conversation history
 * @param isAnsweringQuestion - Whether user is answering a Scapper question (ask_user)
 */
export function classifyPromptType(
  message: string,
  conversationHistory: GroqMessage[],
  isAnsweringQuestion: boolean = false
): PromptType {
  // If this is a response to Scapper's ask_user question
  if (isAnsweringQuestion) {
    return "clarification_response"
  }

  // If this is a plan approval/rejection
  const trimmed = message.trim()
  if (
    trimmed.startsWith("[PLAN_APPROVED]") ||
    trimmed.toLowerCase().includes("plan cancelled") ||
    trimmed.toLowerCase() === "yes" ||
    trimmed.toLowerCase() === "no" ||
    trimmed.toLowerCase() === "proceed" ||
    trimmed.toLowerCase() === "approve" ||
    trimmed.toLowerCase() === "cancel"
  ) {
    // Check if there's a pending plan in recent history
    const recentMessages = conversationHistory.slice(-5)
    const hasPlanProposal = recentMessages.some(
      (m) => m.role === "assistant" && m.content?.includes("[PLAN_PROPOSAL]")
    )

    if (hasPlanProposal) {
      return "plan_approval"
    }
  }

  // New prompt = empty conversation history
  if (conversationHistory.length === 0) {
    return "new_prompt"
  }

  // Everything else is a follow-up
  return "follow_up"
}

/**
 * Check if this is truly a new prompt (counts against quota)
 */
export function isNewPrompt(conversationHistory: GroqMessage[]): boolean {
  return conversationHistory.length === 0
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
