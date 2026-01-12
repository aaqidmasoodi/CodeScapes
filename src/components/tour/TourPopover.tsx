"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Code,
  Files,
  Play,
  RotateCw,
  Zap,
  Terminal,
  BarChart3,
  Box,
  Lock,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StepPosition } from "@/lib/tours/types"

// Icon map for dynamic rendering
const TOUR_ICONS: Record<string, LucideIcon> = {
  Code,
  Files,
  Play,
  RotateCw,
  Zap,
  Terminal,
  BarChart3,
  Box,
  Lock,
}

interface TourPopoverProps {
  /** CSS selector for the target element */
  target: string
  /** Step title */
  title: string
  /** Step description */
  description: string
  /** Position relative to target */
  position?: StepPosition
  /** Current step number (1-indexed for display) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
  /** Show back button */
  showBack?: boolean
  /** Show next button */
  showNext?: boolean
  /** Next button label */
  nextLabel?: string
  /** Callback for next */
  onNext?: () => void
  /** Callback for back */
  onBack?: () => void
  /** Callback for skip/exit */
  onSkip?: () => void
  /** Icon/emoji for the step */
  icon?: string
}

export function TourPopover({
  target,
  title,
  description,
  position = "bottom",
  currentStep,
  totalSteps,
  showBack = true,
  showNext = true,
  nextLabel = "Next",
  onNext,
  onBack,
  onSkip,
  icon,
}: TourPopoverProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [popoverSize, setPopoverSize] = useState({ width: 320, height: 200 })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(target)
      if (element) {
        setTargetRect(element.getBoundingClientRect())
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [target])

  // Measure popover size
  useEffect(() => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect()
      setPopoverSize({ width: rect.width, height: rect.height })
    }
  }, [title, description])

  if (!mounted || !targetRect) return null

  // Calculate popover position
  const gap = 16
  let left = 0
  let top = 0

  switch (position) {
    case "top":
      left = targetRect.left + targetRect.width / 2 - popoverSize.width / 2
      top = targetRect.top - popoverSize.height - gap
      break
    case "bottom":
      left = targetRect.left + targetRect.width / 2 - popoverSize.width / 2
      top = targetRect.bottom + gap
      break
    case "left":
      left = targetRect.left - popoverSize.width - gap
      top = targetRect.top + targetRect.height / 2 - popoverSize.height / 2
      break
    case "right":
      left = targetRect.right + gap
      top = targetRect.top + targetRect.height / 2 - popoverSize.height / 2
      break
    case "center":
      left = window.innerWidth / 2 - popoverSize.width / 2
      top = window.innerHeight / 2 - popoverSize.height / 2
      break
  }

  // Keep within viewport
  left = Math.max(16, Math.min(left, window.innerWidth - popoverSize.width - 16))
  top = Math.max(16, Math.min(top, window.innerHeight - popoverSize.height - 16))

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[10000] w-80 max-w-[calc(100vw-32px)] rounded-xl border border-border bg-card shadow-2xl duration-200 animate-in fade-in-0 zoom-in-95"
      style={{ left, top }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          {icon &&
            TOUR_ICONS[icon] &&
            (() => {
              const IconComponent = TOUR_ICONS[icon]
              return <IconComponent className="h-5 w-5 text-primary" />
            })()}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="-mr-2 -mt-1 h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onSkip}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 rounded-b-xl border-t border-border bg-muted/30 px-4 py-3">
        {/* Progress dots */}
        <div className="flex shrink-0 items-center gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === currentStep - 1
                  ? "bg-primary"
                  : i < currentStep - 1
                    ? "bg-primary/50"
                    : "bg-muted-foreground/30"
              }`}
            />
          ))}
          <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground">
            {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {showBack && currentStep > 1 && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
          {showNext && (
            <Button size="sm" onClick={onNext} className="h-8">
              {nextLabel}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
