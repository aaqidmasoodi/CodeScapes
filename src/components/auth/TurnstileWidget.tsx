import Turnstile from "react-turnstile"
import { cn } from "@/lib/utils"

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  className?: string
}

/**
 * Cloudflare Turnstile CAPTCHA Widget
 *
 * Provides bot protection for forms. The token from onVerify
 * must be validated server-side before processing the action.
 */
export function TurnstileWidget({ onVerify, onError, onExpire, className }: TurnstileWidgetProps) {
  const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY

  if (!siteKey) {
    console.warn("VITE_CLOUDFLARE_TURNSTILE_SITE_KEY not configured")
    // In development without key, auto-pass (for testing)
    if (import.meta.env.DEV) {
      onVerify("dev-bypass-token")
      return null
    }
    return null
  }

  return (
    <div className={cn("flex justify-center", className)}>
      <Turnstile
        sitekey={siteKey}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpire}
        theme="auto"
      />
    </div>
  )
}
