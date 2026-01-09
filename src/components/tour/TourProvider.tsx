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
import { useAuth } from "@/hooks/useAuth"

// Storage key for completed tours (user-specific when possible)
const COMPLETED_TOURS_KEY_PREFIX = "codescapes_completed_tours"

// Get user-specific storage key
function getStorageKey(userId: string | null): string {
  return userId ? `${COMPLETED_TOURS_KEY_PREFIX}_${userId}` : `${COMPLETED_TOURS_KEY_PREFIX}_anon`
}

// Get completed tours from localStorage - SYNCHRONOUS for immediate availability
function getCompletedToursSync(userId: string | null): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save completed tours to localStorage
function saveCompletedToursLocal(tours: string[], userId: string | null) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(tours))
  } catch {
    // Ignore storage errors
  }
}

// Save completed tours to Supabase profile
async function saveCompletedToursProfile(tours: string[], userId: string | null) {
  if (!userId) return

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        preferences: {
          completed_tours: tours,
        },
      })
      .eq("id", userId)

    if (error) {
      console.error("[TourProvider] Failed to save to profile:", error)
    }
  } catch (error) {
    console.error("[TourProvider] Exception saving to profile:", error)
  }
}

// Load completed tours from Supabase profile
async function loadCompletedToursProfile(userId: string | null): Promise<string[]> {
  if (!userId) return []

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("[TourProvider] Failed to load from profile:", error)
      return []
    }

    return data?.preferences?.completed_tours || []
  } catch (error) {
    console.error("[TourProvider] Exception loading from profile:", error)
    return []
  }
}

// Default context value
const defaultContextValue: TourContextValue = {
  activeTourId: null,
  currentStepIndex: 0,
  isActive: false,
  stepCompleted: false,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  exitTour: () => {},
  completeStep: () => {},
  currentTour: null,
  currentStep: null,
  hasCompletedTour: () => false,
  resetTour: () => {},
  markTourDismissed: () => {},
  isLoadingCompletedTours: true,
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
  const { user } = useAuth()
  const userId = user?.id || null

  const [state, setState] = useState<TourState>({
    activeTourId: null,
    currentStepIndex: 0,
    isActive: false,
    stepCompleted: false,
  })

  // Initialize from localStorage - will be updated when user changes
  const [completedTours, setCompletedTours] = useState<string[]>([])
  const [isLoadingCompletedTours, setIsLoadingCompletedTours] = useState(true)

  // Sync completed tours when user changes
  useEffect(() => {
    async function syncCompletedTours() {
      setIsLoadingCompletedTours(true)

      // Step 1: Load from localStorage for this user (instant, no flash)
      const localTours = getCompletedToursSync(userId)

      // Step 2: If logged in, also check database
      if (userId) {
        const profileTours = await loadCompletedToursProfile(userId)

        // Merge: take union of local and remote
        const merged = [...new Set([...localTours, ...profileTours])]

        // Save merged back to both
        setCompletedTours(merged)
        saveCompletedToursLocal(merged, userId)

        // If local had something remote didn't, sync to remote
        if (merged.length > profileTours.length) {
          saveCompletedToursProfile(merged, userId)
        }
      } else {
        // Logged out: just use local anonymous storage
        setCompletedTours(localTours)
      }

      setIsLoadingCompletedTours(false)
    }

    syncCompletedTours()
  }, [userId]) // Re-run when user changes!

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
  const markTourCompleted = useCallback(
    (tourId: string) => {
      setCompletedTours((prev) => {
        if (prev.includes(tourId)) return prev
        const newCompleted = [...prev, tourId]
        saveCompletedToursLocal(newCompleted, userId)
        saveCompletedToursProfile(newCompleted, userId)
        return newCompleted
      })
    },
    [userId]
  )

  // Start a tour
  const startTour = useCallback(
    (tourId: string) => {
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
    },
    [tours]
  )

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
  const resetTour = useCallback(
    (tourId: string) => {
      setCompletedTours((prev) => {
        const newCompleted = prev.filter((id) => id !== tourId)
        saveCompletedToursLocal(newCompleted, userId)
        saveCompletedToursProfile(newCompleted, userId)
        return newCompleted
      })
    },
    [userId]
  )

  // Mark a tour as dismissed (for skip/close) - same as completing it
  const markTourDismissed = useCallback(
    (tourId: string) => {
      markTourCompleted(tourId)
    },
    [markTourCompleted]
  )

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
      isLoadingCompletedTours,
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
      isLoadingCompletedTours,
    ]
  )

  return <TourContext.Provider value={contextValue}>{children}</TourContext.Provider>
}
