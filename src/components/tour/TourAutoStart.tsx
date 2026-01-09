"use client"

import { useEffect, useState } from "react"
import { useTour } from "./TourProvider"
import { getTourForEnvironment } from "@/lib/tours"
import { TourWelcomeModal } from "./TourWelcomeModal"
import { useAuth } from "@/hooks/useAuth"

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
 * Note: Only shows for LOGGED IN users who haven't completed the tour.
 * Skipping or closing marks the tour as dismissed so it won't show again.
 */
export function TourAutoStart({ environment, environmentName }: TourAutoStartProps) {
  const { user } = useAuth()
  const { startTour, hasCompletedTour, isActive, markTourDismissed, isLoadingCompletedTours } =
    useTour()
  const [showWelcome, setShowWelcome] = useState(false)
  const [tourId, setTourId] = useState<string | null>(null)

  useEffect(() => {
    // IMPORTANT: Only show tour welcome for LOGGED IN users
    if (!user) return

    // Wait for completed tours to load from database
    if (isLoadingCompletedTours) return

    // If already shown modal in this session or tour active, skip
    if (hasShownModal || isActive) return

    // Get tour for this environment
    const tour = getTourForEnvironment(environment)
    if (!tour) return

    // Check if already completed/dismissed (persisted in localStorage/profile)
    if (hasCompletedTour(tour.id)) return

    // Check if showOnFirstVisit is enabled
    if (!tour.showOnFirstVisit) return

    // Wait 3 seconds before showing - let user settle in
    const timer = setTimeout(() => {
      hasShownModal = true
      setTourId(tour.id)
      setShowWelcome(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [environment, hasCompletedTour, isActive, user, isLoadingCompletedTours])

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
  const displayName =
    environmentName ||
    (environment === "python"
      ? "Python Environment"
      : environment === "web"
        ? "Web Environment"
        : environment === "r"
          ? "R Environment"
          : environment === "flowscape"
            ? "FlowScape Environment"
            : "CodeScapes")

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
