import { Zap, Bug, Hammer, Trophy } from "lucide-react"

export function BadgeEarlyAdopter({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2 text-yellow-600 dark:text-yellow-400 ${className}`}
    >
      <Zap className="h-6 w-6" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">Early Adopter</span>
    </div>
  )
}

export function BadgeBuilder({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 ${className}`}
    >
      <Hammer className="h-6 w-6" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">Builder</span>
    </div>
  )
}

export function BadgeBugHunter({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-600 dark:text-red-400 ${className}`}
    >
      <Bug className="h-6 w-6" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">Bug Hunter</span>
    </div>
  )
}

export function BadgeTopContributor({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400 ${className}`}
    >
      <Trophy className="h-6 w-6" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">Contributor</span>
    </div>
  )
}
