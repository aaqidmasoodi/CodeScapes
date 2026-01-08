"use client"

import { useEffect, useRef } from "react"
import { useTour } from "./TourProvider"
import { TourSpotlight } from "./TourSpotlight"
import { TourBeacon } from "./TourBeacon"
import { TourPopover } from "./TourPopover"

/**
 * TourStep - Main orchestrator component
 * Renders spotlight, beacon, and popover based on current tour state
 * Handles step completion detection (click, type, etc.)
 */
export function TourStep() {
    const {
        isActive,
        currentStep,
        currentTour,
        currentStepIndex,
        stepCompleted,
        nextStep,
        prevStep,
        exitTour,
        completeStep,
    } = useTour()

    const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Handle click detection for "click" type steps
    useEffect(() => {
        if (!isActive || !currentStep || currentStep.type !== "click") return

        const handleClick = (e: MouseEvent) => {
            const target = document.querySelector(currentStep.target)
            if (!target) return

            // Check if click was on target or inside target
            if (target.contains(e.target as Node)) {
                completeStep()
            }
        }

        // Use capture to catch clicks before they're handled
        document.addEventListener("click", handleClick, true)
        return () => document.removeEventListener("click", handleClick, true)
    }, [isActive, currentStep, completeStep])

    // Handle auto-advance for "observe" type steps ONLY if autoAdvanceDelay is explicitly set
    useEffect(() => {
        if (!isActive || !currentStep || currentStep.type !== "observe") return

        // Only auto-advance if explicitly configured - user controls pace by default
        if (!currentStep.autoAdvanceDelay) return

        autoAdvanceTimeoutRef.current = setTimeout(() => {
            nextStep()
        }, currentStep.autoAdvanceDelay)

        return () => {
            if (autoAdvanceTimeoutRef.current) {
                clearTimeout(autoAdvanceTimeoutRef.current)
            }
        }
    }, [isActive, currentStep, nextStep])

    // Handle celebration + auto-advance after step completion
    useEffect(() => {
        if (!stepCompleted || !currentStep) return

        // Show celebration briefly, then advance
        const celebrationDuration = currentStep.celebration ? 1500 : 500
        celebrationTimeoutRef.current = setTimeout(() => {
            nextStep()
        }, celebrationDuration)

        return () => {
            if (celebrationTimeoutRef.current) {
                clearTimeout(celebrationTimeoutRef.current)
            }
        }
    }, [stepCompleted, currentStep, nextStep])

    // Keyboard navigation
    useEffect(() => {
        if (!isActive) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                exitTour()
            } else if (e.key === "ArrowRight" && currentStep?.type === "observe") {
                nextStep()
            } else if (e.key === "ArrowLeft" && currentStepIndex > 0) {
                prevStep()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isActive, exitTour, nextStep, prevStep, currentStep, currentStepIndex])

    // Debug log tour state
    console.log("[TourStep] Render check - isActive:", isActive, "currentStep:", currentStep?.id, "currentTour:", currentTour?.id)

    // Don't render if tour not active
    if (!isActive || !currentStep || !currentTour) {
        console.log("[TourStep] NOT rendering - conditions not met")
        return null
    }
    console.log("[TourStep] RENDERING step:", currentStep.id, "target:", currentStep.target)

    const totalSteps = currentTour.steps.length
    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === totalSteps - 1
    const showBeacon = currentStep.beacon !== false && currentStep.type === "click"

    return (
        <>
            {/* Spotlight overlay */}
            <TourSpotlight
                target={currentStep.target}
                allowOutsideClick={false}
            />

            {/* Beacon indicator for click steps */}
            {showBeacon && !stepCompleted && (
                <TourBeacon
                    target={currentStep.target}
                    label="Click here"
                />
            )}

            {/* Popover with step content */}
            <TourPopover
                target={currentStep.target}
                title={stepCompleted && currentStep.celebration ? "✨ " + currentStep.celebration : currentStep.title}
                description={stepCompleted && currentStep.celebration ? "" : currentStep.description}
                position={currentStep.position || "bottom"}
                currentStep={currentStepIndex + 1}
                totalSteps={totalSteps}
                showBack={!isFirstStep && !stepCompleted}
                showNext={!stepCompleted}
                nextLabel={isLastStep ? "Done" : "Next"}
                onNext={nextStep}
                onBack={prevStep}
                onSkip={exitTour}
                icon={currentStep.icon}
            />
        </>
    )
}
