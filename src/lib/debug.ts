/**
 * Debug Logger Utility
 *
 * Conditionally logs messages based on VITE_DEBUG environment variable.
 * In production (Vercel), set VITE_DEBUG=false to suppress internal logs.
 * In development, set VITE_DEBUG=true in .env.local to see all logs.
 *
 * Usage:
 *   import { debug } from "@/lib/debug"
 *   debug.log("[Component] Message", data)
 *   debug.warn("[Component] Warning", data)
 */

const DEBUG = import.meta.env.VITE_DEBUG === "true"

export const debug = {
  /**
   * Logs a message to console if DEBUG is enabled.
   * Use for general informational logs.
   */
  log: (...args: unknown[]): void => {
    if (DEBUG) console.log(...args)
  },

  /**
   * Logs a warning to console if DEBUG is enabled.
   * Use for non-critical warnings during development.
   */
  warn: (...args: unknown[]): void => {
    if (DEBUG) console.warn(...args)
  },

  /**
   * Always logs errors regardless of DEBUG setting.
   * Errors should always be visible for debugging production issues.
   */
  error: (...args: unknown[]): void => {
    console.error(...args)
  },
}

export default debug
