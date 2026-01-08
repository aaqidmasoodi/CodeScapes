"use client"

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useMemo,
    type ReactNode,
} from "react"
import type { TourConfig, TourContextValue, TourState } from "@/lib/tours/types"
import { supabase } from "@/lib/supabase"

// Storage key for completed tours
const COMPLETED_TOURS_KEY = "codescapes_completed_tours"

// Get completed tours from localStorage - SYNCHRONOUS for immediate availability
function getCompletedToursSync(): string[] {
    if (typeof window === "undefined") return []
    try {
        const stored = localStorage.getItem(COMPLETED_TOURS_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

// Save completed tours to localStorage
function saveCompletedToursLocal(tours: string[]) {
    if (typeof window === "undefined") return
    try {
        localStorage.setItem(COMPLETED_TOURS_KEY, JSON.stringify(tours))
    } catch {
        // Ignore storage errors
    }
}

// Save completed tours to Supabase profile
async function saveCompletedToursProfile(tours: string[]) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from("profiles")
            .update({
                preferences: {
                    completed_tours: tours
                }
            })
            .eq("id", user.id)
    } catch (error) {
        console.error("[TourProvider] Failed to save to profile:", error)
    }
}

// Load completed tours from Supabase profile
async function loadCompletedToursProfile(): Promise<string[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data } = await supabase
            .from("profiles")
            .select("preferences")
            .eq("id", user.id)
            .single()

        if (data?.preferences?.completed_tours) {
            return data.preferences.completed_tours
        }
        return []
    } catch {
        return []
    }
}

// Default context value
const defaultContextValue: TourContextValue = {
    activeTourId: null,
    currentStepIndex: 0,
    isActive: false,
    stepCompleted: false,
    startTour: () => { },
    nextStep: () => { },
    prevStep: () => { },
    exitTour: () => { },
    completeStep: () => { },
    currentTour: null,
    currentStep: null,
    hasCompletedTour: () => false,
    resetTour: () => { },
    markTourDismissed: () => { },
}

// Create context
const TourContext = createContext<TourContextValue>(defaultContextValue)

// Hook to consume tour context
export function useTour() {
    return useContext(TourContext)
}

interface TourProviderProps {
    children: ReactNode
    /** Registry of available tours */
    tours: Record<string, TourConfig>
    /** Callback when tour completes */
    onTourComplete?: (tourId: string) => void
}

export function TourProvider({ children, tours, onTourComplete }: TourProviderProps) {
    const [state, setState] = useState<TourState>({
        activeTourId: null,
        currentStepIndex: 0,
        isActive: false,
        stepCompleted: false,
    })

    // CRITICAL: Initialize from localStorage SYNCHRONOUSLY to prevent race conditions
    // This ensures hasCompletedTour returns correct value on first render
    const [completedTours, setCompletedTours] = useState<string[]>(() => {
        return getCompletedToursSync()
    })

    // Async merge with profile data (enhancement, not blocking)
    useEffect(() => {
        async function mergeWithProfile() {
            const profileTours = await loadCompletedToursProfile()
            if (profileTours.length === 0) return

            setCompletedTours((current) => {
                const merged = [...new Set([...current, ...profileTours])]
                // Only update if there are new items from profile
                if (merged.length > current.length) {
                    saveCompletedToursLocal(merged)
                    return merged
                }
                return current
            })
        }
        mergeWithProfile()
    }, [])

    // Get current tour config
    const currentTour = useMemo(() => {
        if (!state.activeTourId) return null
        return tours[state.activeTourId] || null
    }, [state.activeTourId, tours])

    // Get current step config
    const currentStep = useMemo(() => {
        if (!currentTour) return null
        return currentTour.steps[state.currentStepIndex] || null
    }, [currentTour, state.currentStepIndex])

    // Helper to mark tour as completed (saves to both localStorage and profile)
    const markTourCompleted = useCallback((tourId: string) => {
        setCompletedTours((prev) => {
            if (prev.includes(tourId)) return prev
            const newCompleted = [...prev, tourId]
            saveCompletedToursLocal(newCompleted)
            saveCompletedToursProfile(newCompleted)
            return newCompleted
        })
    }, [])

    // Start a tour
    const startTour = useCallback((tourId: string) => {
        const tour = tours[tourId]
        if (!tour || tour.steps.length === 0) {
            console.warn(`[TourProvider] Tour "${tourId}" not found or has no steps`)
            return
        }

        setState({
            activeTourId: tourId,
            currentStepIndex: 0,
            isActive: true,
            stepCompleted: false,
        })
    }, [tours])

    // Mark current step as completed
    const completeStep = useCallback(() => {
        setState((prev) => ({
            ...prev,
            stepCompleted: true,
        }))
    }, [])

    // Advance to next step
    const nextStep = useCallback(() => {
        setState((prev) => {
            if (!prev.activeTourId) return prev

            const tour = tours[prev.activeTourId]
            if (!tour) return prev

            const nextIndex = prev.currentStepIndex + 1

            // Tour complete
            if (nextIndex >= tour.steps.length) {
                markTourCompleted(prev.activeTourId)
                onTourComplete?.(prev.activeTourId)

                return {
                    activeTourId: null,
                    currentStepIndex: 0,
                    isActive: false,
                    stepCompleted: false,
                }
            }

            return {
                ...prev,
                currentStepIndex: nextIndex,
                stepCompleted: false,
            }
        })
    }, [tours, markTourCompleted, onTourComplete])

    // Go back to previous step
    const prevStep = useCallback(() => {
        setState((prev) => {
            if (prev.currentStepIndex <= 0) return prev
            return {
                ...prev,
                currentStepIndex: prev.currentStepIndex - 1,
                stepCompleted: false,
            }
        })
    }, [])

    // Exit/skip the tour - marks as completed so it won't show again
    const exitTour = useCallback(() => {
        if (state.activeTourId) {
            markTourCompleted(state.activeTourId)
        }

        setState({
            activeTourId: null,
            currentStepIndex: 0,
            isActive: false,
            stepCompleted: false,
        })
    }, [state.activeTourId, markTourCompleted])

    // Check if a tour has been completed
    const hasCompletedTour = useCallback(
        (tourId: string) => completedTours.includes(tourId),
        [completedTours]
    )

    // Reset a tour's completion status (for restart)
    const resetTour = useCallback((tourId: string) => {
        setCompletedTours((prev) => {
            const newCompleted = prev.filter((id) => id !== tourId)
            saveCompletedToursLocal(newCompleted)
            saveCompletedToursProfile(newCompleted)
            return newCompleted
        })
    }, [])

    // Mark a tour as dismissed (for skip/close) - same as completing it
    const markTourDismissed = useCallback((tourId: string) => {
        markTourCompleted(tourId)
    }, [markTourCompleted])

    // Context value
    const contextValue = useMemo<TourContextValue>(
        () => ({
            ...state,
            startTour,
            nextStep,
            prevStep,
            exitTour,
            completeStep,
            currentTour,
            currentStep,
            hasCompletedTour,
            resetTour,
            markTourDismissed,
        }),
        [
            state,
            startTour,
            nextStep,
            prevStep,
            exitTour,
            completeStep,
            currentTour,
            currentStep,
            hasCompletedTour,
            resetTour,
            markTourDismissed,
        ]
    )

    return <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
}
