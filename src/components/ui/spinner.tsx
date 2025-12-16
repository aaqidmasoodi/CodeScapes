import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <div role="status" {...props}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
}

export function LoadingOverlay({ message, className, ...props }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <Spinner size="lg" />
      {message && <p className="animate-pulse text-muted-foreground">{message}</p>}
    </div>
  )
}
