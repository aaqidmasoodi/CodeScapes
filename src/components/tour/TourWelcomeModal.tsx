"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Check } from "lucide-react"

interface TourWelcomeModalProps {
    open: boolean
    onStart: () => void
    onSkip: () => void
    environmentName?: string
}

/**
 * TourWelcomeModal - Opt-in modal asking if user wants a guided tour
 */
export function TourWelcomeModal({
    open,
    onStart,
    onSkip,
    environmentName = "CodeScapes",
}: TourWelcomeModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onSkip()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Welcome to {environmentName}!
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Would you like a quick guided tour? We'll show you around in about 60 seconds.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            Learn how to run your code
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            See where your output appears
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            Discover helpful features
                        </li>
                    </ul>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onSkip}>
                        Skip for now
                    </Button>
                    <Button onClick={onStart}>
                        Start Tour
                        <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
