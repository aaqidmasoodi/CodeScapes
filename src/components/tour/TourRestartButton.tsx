"use client"

import { useTour } from "./TourProvider"
import { getTourForEnvironment } from "@/lib/tours"

interface TourRestartButtonProps {
    /** Environment to restart tour for */
    environment: string
}

/**
 * TourRestartButtonWrapper - Hidden helper that provides a clickable element
 * for restarting the tour. Used with document.getElementById('tour-restart-btn')
 * Must be placed inside TourProvider
 */
export function TourRestartButtonWrapper({ environment }: TourRestartButtonProps) {
    const { resetTour, startTour } = useTour()

    const handleClick = () => {
        const tour = getTourForEnvironment(environment)
        if (!tour) return

        // Reset completion status and start tour
        resetTour(tour.id)
        startTour(tour.id)
    }

    // Hidden button that can be triggered programmatically
    return (
        <button
            id="tour-restart-btn"
            onClick={handleClick}
            style={{ display: 'none' }}
            aria-hidden="true"
        />
    )
}
