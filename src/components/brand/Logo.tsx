import { useId } from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
}

/**
 * Square icon-only logo for compact spaces
 */
export function CodeScapeLogo({ className, size = 32 }: LogoProps) {
  const id = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <defs>
        <linearGradient id={`${id}-g1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Rounded square base */}
      <rect x="3" y="3" width="26" height="26" rx="6" fill={`url(#${id}-g1)`} />

      {/* Code brackets */}
      <path
        d="M13 11L9 16L13 21"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 11L23 16L19 21"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center slash */}
      <path
        d="M17.5 10L14.5 22"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

interface FullLogoProps {
  className?: string
  height?: number
}

/**
 * Horizontal logo with icon + "CodeScapes" wordmark
 */
export function CodeScapeFullLogo({ className, height = 40 }: FullLogoProps) {
  const id = useId()
  // Aspect ratio: icon (1:1) + spacing + text
  const width = height * 5.5

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <defs>
        <linearGradient id={`${id}-icon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id={`${id}-accent`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={`${id}-text`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* === ICON MARK === */}
      <g transform="translate(4, 4)">
        {/* Rounded square */}
        <rect width="32" height="32" rx="7" fill={`url(#${id}-icon)`} />

        {/* Depth corner */}
        <path d="M32 16L32 32L16 32L32 16Z" fill={`url(#${id}-accent)`} opacity="0.35" />

        {/* Code brackets */}
        <path
          d="M13 10L8 16L13 22"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 10L24 16L19 22"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Slash */}
        <path
          d="M17.5 9L14.5 23"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />
      </g>

      {/* === WORDMARK === */}
      <text
        x="48"
        y="28"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        <tspan fill={`url(#${id}-text)`}>Code</tspan>
        <tspan fill="currentColor">Scapes</tspan>
      </text>
    </svg>
  )
}
