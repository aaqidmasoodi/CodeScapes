import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
}

export function CodeScapeLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
          <stop offset="100%" stopColor="#6366f1" /> {/* Indigo-500 */}
        </linearGradient>
      </defs>

      {/* Outer Hexagon/Shape base */}
      <path
        d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z"
        fill="url(#logo-gradient)"
        fillOpacity="0.2"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner "Code" Brackets / Circuit lines */}
      <path
        d="M20 12L24 16L20 20M12 12L8 16L12 20"
        stroke="url(#logo-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Dot/Core */}
      <circle cx="16" cy="16" r="2" fill="url(#logo-gradient)" />
    </svg>
  )
}
