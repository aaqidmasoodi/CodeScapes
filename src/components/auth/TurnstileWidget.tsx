import { forwardRef, useImperativeHandle, useState } from "react"
import Turnstile from "react-turnstile"
import { cn } from "@/lib/utils"

export interface TurnstileWidgetRef {
  reset: () => void
}

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
export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onVerify, onError, onExpire, className }, ref) => {
    const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY
    const [widgetKey, setWidgetKey] = useState(0)

    useImperativeHandle(ref, () => ({
      reset: () => {
        setWidgetKey((prev) => prev + 1)
      },
    }))

    if (!siteKey) {
      console.warn("VITE_CLOUDFLARE_TURNSTILE_SITE_KEY not configured")
      // In development without key, auto-pass (for testing)
      if (import.meta.env.DEV) {
        // We defer this slightly to avoid update-during-render warning if immediate
        setTimeout(() => onVerify("dev-bypass-token"), 0)
        return null
      }
      return null
    }

    return (
      <div className={cn("flex justify-center", className)}>
        <Turnstile
          key={widgetKey}
          sitekey={siteKey}
          onVerify={onVerify}
          onError={onError}
          onExpire={onExpire}
          theme="auto"
        />
      </div>
    )
  }
)

TurnstileWidget.displayName = "TurnstileWidget"
