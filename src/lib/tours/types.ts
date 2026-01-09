/**
 * Tour System Types
 * Defines the structure for interactive guided tours
 */

export type StepType = "click" | "observe" | "type" | "hover"
export type StepPosition = "top" | "bottom" | "left" | "right" | "center"

export interface TourStep {
  /** Unique identifier for this step */
  id: string

  /** Type of interaction required */
  type: StepType

  /** CSS selector for the target element */
  target: string

  /** Step title (supports emoji) */
  title: string

  /** Step description */
  description: string

  /** Popover position relative to target */
  position?: StepPosition

  /** Show pulsing beacon on target */
  beacon?: boolean

  /** Message to show after step completion */
  celebration?: string

  /** Auto-advance delay in ms (for "observe" type) */
  autoAdvanceDelay?: number

  /** Required input text for "type" steps (partial match) */
  requiredInput?: string

  /** Optional icon for the step */
  icon?: string
}

export interface TourConfig {
  /** Unique tour identifier */
  id: string

  /** Display name for the tour */
  name: string

  /** Environment this tour is for (python, web, r, flowscape) */
  environment?: string

  /** Auto-start on first visit */
  showOnFirstVisit: boolean

  /** Tour steps */
  steps: TourStep[]
}

export interface TourState {
  /** Currently active tour ID */
  activeTourId: string | null

  /** Current step index */
  currentStepIndex: number

  /** Is tour currently running */
  isActive: boolean

  /** Has the current step been completed (action performed) */
  stepCompleted: boolean
}

export interface TourContextValue extends TourState {
  /** Start a tour by ID */
  startTour: (tourId: string) => void

  /** Advance to next step */
  nextStep: () => void

  /** Go back to previous step */
  prevStep: () => void

  /** Exit/skip the tour */
  exitTour: () => void

  /** Mark current step as completed */
  completeStep: () => void

  /** Get current tour config */
  currentTour: TourConfig | null

  /** Get current step config */
  currentStep: TourStep | null

  /** Check if a tour has been completed */
  hasCompletedTour: (tourId: string) => boolean

  /** Reset a tour's completion status */
  resetTour: (tourId: string) => void

  /** Mark a tour as dismissed (skip/close) - prevents showing again */
  markTourDismissed: (tourId: string) => void

  /** True while loading completed tours from database */
  isLoadingCompletedTours: boolean
}
