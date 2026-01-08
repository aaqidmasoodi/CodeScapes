/**
 * Tour Registry
 * Central export for all tour configurations
 */
import type { TourConfig } from "./types"
import { pythonTour } from "./python-tour"
import { webTour } from "./web-tour"
import { rTour } from "./r-tour"
import { flowscapeTour } from "./flowscape-tour"

// Export individual tours
export { pythonTour } from "./python-tour"
export { webTour } from "./web-tour"
export { rTour } from "./r-tour"
export { flowscapeTour } from "./flowscape-tour"
export type { TourConfig, TourStep, StepType, StepPosition } from "./types"

// Tour registry by ID
export const tourRegistry: Record<string, TourConfig> = {
    "python-intro": pythonTour,
    "web-intro": webTour,
    "r-intro": rTour,
    "flowscape-intro": flowscapeTour,
}

// Get tour by environment
export function getTourForEnvironment(environment: string): TourConfig | null {
    switch (environment) {
        case "python":
            return pythonTour
        case "web":
        case "javascript":
        case "html":
            return webTour
        case "r":
            return rTour
        case "flowscape":
            return flowscapeTour
        default:
            return null
    }
}
