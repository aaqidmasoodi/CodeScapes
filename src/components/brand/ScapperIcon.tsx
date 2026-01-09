import { useId } from "react"
import { cn } from "@/lib/utils"

interface ScapperIconProps {
  className?: string
  size?: number
}

/**
 * Scapper AI Assistant Icon
 * Inspired by CodeScape logo with AI sparkle accent
 */
export function ScapperIcon({ className, size = 20 }: ScapperIconProps) {
  const id = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id={`${id}-sparkle`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Rounded square base */}
      <rect x="2" y="4" width="18" height="18" rx="4" fill={`url(#${id}-bg)`} />

      {/* Code brackets - simplified */}
      <path
        d="M9 10L6 13L9 16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 10L16 13L13 16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* AI Sparkle accent (top-right) */}
      <g transform="translate(16, 2)">
        <circle cx="3" cy="3" r="3.5" fill={`url(#${id}-sparkle)`} />
        <path d="M3 1.5V4.5M1.5 3H4.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/**
 * Pro Badge - Shows "PRO" with brand gradient
 */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
        className
      )}
    >
      Pro
    </span>
  )
}
