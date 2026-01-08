"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface TourBeaconProps {
    /** CSS selector for the target element */
    target: string
    /** Beacon label text */
    label?: string
    /** Show arrow pointing to target */
    showArrow?: boolean
}

export function TourBeacon({ target, label = "Click here", showArrow = true }: TourBeaconProps) {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [mounted, setMounted] = useState(false)

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid pattern for portal mount detection
    useEffect(() => {
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

    if (!mounted || !targetRect) return null

    // Position beacon at the top-right corner of the target
    const beaconStyle = {
        left: targetRect.right - 12,
        top: targetRect.top - 12,
    }

    return createPortal(
        <div
            className="fixed z-[9999] pointer-events-none"
            style={beaconStyle}
        >
            {/* Pulsing beacon */}
            <div className="relative">
                {/* Outer pulse ring */}
                <div className="absolute inset-0 w-6 h-6 rounded-full bg-blue-500/30 animate-ping" />

                {/* Inner solid circle */}
                <div className="relative w-6 h-6 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                </div>
            </div>

            {/* Label with arrow */}
            {label && (
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-1 whitespace-nowrap">
                    {showArrow && (
                        <svg
                            className="w-4 h-4 text-blue-400 animate-bounce-x"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    )}
                    <span className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-md shadow-lg">
                        {label}
                    </span>
                </div>
            )}
        </div>,
        document.body
    )
}
