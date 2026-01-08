/**
 * R Environment Tour
 * Interactive onboarding for R/RWebAssembly projects
 */
import type { TourConfig } from "./types"

export const rTour: TourConfig = {
    id: "r-intro",
    name: "R Environment",
    environment: "r",
    showOnFirstVisit: true,
    steps: [
        {
            id: "welcome",
            type: "observe",
            target: "[data-tour='code-editor']",
            title: "Welcome to R in the Browser! 📊",
            description: "Run R code with WebR - no installation needed.",
            position: "center",
            icon: "👋",
            autoAdvanceDelay: 3000,
        },
        {
            id: "run-button",
            type: "click",
            target: "[data-tour='run-button']",
            title: "Run Your Script",
            description: "Click Run to execute your R code. Built-in packages like ggplot2 are available.",
            position: "bottom",
            beacon: true,
            celebration: "Running!",
        },
        {
            id: "preview-pane",
            type: "observe",
            target: "[data-tour='preview-pane']",
            title: "Plots & Output",
            description: "R plots and data frames appear here. ggplot2 works beautifully!",
            position: "left",
            icon: "📈",
            autoAdvanceDelay: 3500,
        },
        {
            id: "complete",
            type: "observe",
            target: "[data-tour='code-editor']",
            title: "Happy Analyzing! 🚀",
            description: "Start exploring your data!",
            position: "center",
            icon: "🎉",
            autoAdvanceDelay: 2500,
        },
    ],
}
