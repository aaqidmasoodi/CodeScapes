/**
 * FlowScape Tour
 * Interactive onboarding for visual block-based programming
 */
import type { TourConfig } from "./types"

export const flowscapeTour: TourConfig = {
    id: "flowscape-intro",
    name: "FlowScape",
    environment: "flowscape",
    showOnFirstVisit: true,
    steps: [
        {
            id: "welcome",
            type: "observe",
            target: "[data-tour='flow-canvas']",
            title: "Welcome to FlowScape! 🧩",
            description: "Build programs visually by connecting blocks!",
            position: "center",
            icon: "👋",
            autoAdvanceDelay: 3000,
        },
        {
            id: "toolbox",
            type: "click",
            target: "[data-tour='block-toolbox']",
            title: "Block Toolbox",
            description: "Drag blocks from here onto the canvas to start building.",
            position: "right",
            beacon: true,
            celebration: "Great!",
        },
        {
            id: "run-button",
            type: "click",
            target: "[data-tour='run-button']",
            title: "Run Your Flow",
            description: "Click Run to execute your visual program!",
            position: "bottom",
            beacon: true,
            celebration: "Running!",
        },
        {
            id: "complete",
            type: "observe",
            target: "[data-tour='flow-canvas']",
            title: "Start Creating! 🚀",
            description: "Drag, connect, and run. No typing required!",
            position: "center",
            icon: "🎉",
            autoAdvanceDelay: 2500,
        },
    ],
}
