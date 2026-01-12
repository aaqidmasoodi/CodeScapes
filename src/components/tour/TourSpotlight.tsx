"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"

interface TourSpotlightProps {
  /** CSS selector for the target element */
  target: string
  /** Padding around the target cutout */
  padding?: number
  /** Click handler for the spotlight overlay */
  onOverlayClick?: () => void
  /** Whether clicking outside target advances the tour */
  allowOutsideClick?: boolean
}

export function TourSpotlight({
  target,
  padding = 8,
  onOverlayClick,
  allowOutsideClick = false,
}: TourSpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const observerRef = useRef<ResizeObserver | null>(null)

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

    // Initial position
    updatePosition()

    // Watch for resize/scroll
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    // Observe target element for size changes
    const element = document.querySelector(target)
    if (element) {
      observerRef.current = new ResizeObserver(updatePosition)
      observerRef.current.observe(element)
    }

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
      observerRef.current?.disconnect()
    }
  }, [target])

  if (!mounted || !targetRect) return null

  // Calculate cutout dimensions with padding
  const cutout = {
    x: targetRect.left - padding,
    y: targetRect.top - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    rx: 8, // border-radius
  }

  const handleClick = (e: React.MouseEvent) => {
    if (allowOutsideClick) {
      onOverlayClick?.()
    }
    e.stopPropagation()
  }

  return createPortal(
    <div className="fixed inset-0 z-[9998]" style={{ isolation: "isolate", pointerEvents: "none" }}>
      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={cutout.x}
              y={cutout.y}
              width={cutout.width}
              height={cutout.height}
              rx={cutout.rx}
              fill="black"
            />
          </mask>
        </defs>
        {/* Dark overlay with hole - blocks clicks outside target */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tour-spotlight-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={handleClick}
        />
      </svg>

      {/* Glow effect around target - does NOT block clicks */}
      <div
        className="pointer-events-none absolute animate-pulse rounded-lg shadow-[0_0_0_4px_rgba(59,130,246,0.5)]"
        style={{
          left: cutout.x,
          top: cutout.y,
          width: cutout.width,
          height: cutout.height,
          borderRadius: cutout.rx,
        }}
      />
    </div>,
    document.body
  )
}
