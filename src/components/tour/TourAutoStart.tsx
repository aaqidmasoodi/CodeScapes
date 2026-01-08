"use client"

import { useEffect, useState } from "react"
import { useTour } from "./TourProvider"
import { getTourForEnvironment } from "@/lib/tours"
import { TourWelcomeModal } from "./TourWelcomeModal"

interface TourAutoStartProps {
    /** Environment type to determine which tour to show */
    environment: string
    /** Display name for the environment */
    environmentName?: string
}

// Module-level tracking to survive component remounts within same session
let hasShownModal = false

/**
 * TourAutoStart - Shows welcome modal asking if user wants a guided tour
 * Must be placed inside TourProvider
 * 
 * Note: Skipping or closing the modal marks the tour as dismissed
 * so it won't show again automatically. Users can restart via sidebar.
 */
export function TourAutoStart({ environment, environmentName }: TourAutoStartProps) {
    const { startTour, hasCompletedTour, isActive, markTourDismissed } = useTour()
    const [showWelcome, setShowWelcome] = useState(false)
    const [tourId, setTourId] = useState<string | null>(null)

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Showing modal based on tour availability check is a valid derived state pattern
    useEffect(() => {
        // If already shown modal in this session or tour active, skip
        if (hasShownModal || isActive) return

        // Get tour for this environment
        const tour = getTourForEnvironment(environment)
        if (!tour) return

        // Check if already completed/dismissed (persisted in localStorage/profile)
        if (hasCompletedTour(tour.id)) return

        // Check if showOnFirstVisit is enabled
        if (!tour.showOnFirstVisit) return

        // Show welcome modal
        hasShownModal = true
        setTourId(tour.id)
        setShowWelcome(true)
    }, [environment, hasCompletedTour, isActive])

    const handleStart = () => {
        setShowWelcome(false)
        if (tourId) {
            startTour(tourId)
        }
    }

    const handleSkip = () => {
        setShowWelcome(false)
        // Mark as dismissed so modal won't show again on refresh
        // User can restart via sidebar help button
        if (tourId) {
            markTourDismissed(tourId)
        }
    }

    // Get display name - always include "Environment" suffix
    const displayName = environmentName || (
        environment === "python" ? "Python Environment" :
            environment === "web" ? "Web Environment" :
                environment === "r" ? "R Environment" :
                    environment === "flowscape" ? "FlowScape Environment" :
                        "CodeScapes"
    )

    return (
        <TourWelcomeModal
            open={showWelcome}
            onStart={handleStart}
            onSkip={handleSkip}
            environmentName={displayName}
        />
    )
}

// Export function to reset tour state (for testing)
export function resetTourAutoStart() {
    hasShownModal = false
}
