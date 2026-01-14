import { useState } from "react"
import {
  Bug,
  Lightbulb,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Send,
  Loader2,
  Megaphone,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { TurnstileWidget } from "@/components/auth/TurnstileWidget"

// ============================================================================
// Types
// ============================================================================

type FeedbackType = "bug" | "feature" | "idea" | "question" | "other"
type Priority = "low" | "medium" | "high"

interface FeedbackOption {
  id: FeedbackType
  icon: React.ElementType
  label: string
  description: string
}

const FEEDBACK_TYPES: FeedbackOption[] = [
  { id: "bug", icon: Bug, label: "Bug", description: "Something isn't working" },
  { id: "feature", icon: Sparkles, label: "Feature", description: "New functionality" },
  { id: "idea", icon: Lightbulb, label: "Idea", description: "General suggestion" },
  { id: "question", icon: HelpCircle, label: "Question", description: "Need help" },
  { id: "other", icon: MessageSquare, label: "Other", description: "Anything else" },
]

// ============================================================================
// Component
// ============================================================================

interface FeedbackDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FeedbackDialog({ trigger, open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Controlled or uncontrolled
  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || setIsOpen

  const resetForm = () => {
    setFeedbackType("bug")
    setTitle("")
    setDescription("")
    setPriority("medium")
    setIncludeSystemInfo(true)
  }

  const getSystemInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to submit feedback",
      })
      return
    }

    if (!title.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Validate Turnstile token server-side
      if (turnstileToken && turnstileToken !== "dev-bypass-token") {
        const verifyRes = await fetch("/api/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
          toast({
            variant: "destructive",
            title: "Verification failed",
            description: "Bot check failed. Please refresh and try again.",
          })
          setTurnstileToken(null)
          setIsSubmitting(false)
          return
        }
      }
      const feedbackData = {
        user_id: user.id,
        type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        priority: feedbackType === "bug" ? priority : null,
        system_info: includeSystemInfo ? getSystemInfo() : null,
        context: {
          page: window.location.pathname,
        },
      }

      const { error } = await supabase.from("feedback").insert(feedbackData)

      if (error) throw error

      toast({
        title: "Thank you for your feedback! ❤️",
        description: "We'll review it and get back to you if needed.",
      })

      resetForm()
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Failed to submit feedback. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not logged in - show auth prompt
  if (!user) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in Required</DialogTitle>
            <DialogDescription>
              Please sign in to submit feedback. This helps us follow up with you if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Send Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve CodeScapes. Your feedback is invaluable!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What type of feedback?</Label>
            <div className="grid grid-cols-5 gap-2">
              {FEEDBACK_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFeedbackType(type.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all hover:bg-accent",
                    feedbackType === type.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border"
                  )}
                >
                  <type.icon
                    className={cn(
                      "h-5 w-5",
                      feedbackType === type.id ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      feedbackType === type.id ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="feedback-title">Title *</Label>
            <Input
              id="feedback-title"
              placeholder={
                feedbackType === "bug"
                  ? "e.g., Can't save files when..."
                  : feedbackType === "feature"
                    ? "e.g., Add dark mode to..."
                    : "Brief summary of your feedback"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="feedback-description">Description *</Label>
            <Textarea
              id="feedback-description"
              placeholder={
                feedbackType === "bug"
                  ? "Steps to reproduce:\n1. \n2. \n3. \n\nExpected: \nActual: "
                  : "Please describe in detail..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Priority (for bugs only) */}
          {feedbackType === "bug" && (
            <div className="space-y-3">
              <Label>Priority</Label>
              <RadioGroup
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low" className="cursor-pointer text-sm font-normal">
                    Low
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="priority-medium" />
                  <Label htmlFor="priority-medium" className="cursor-pointer text-sm font-normal">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high" className="cursor-pointer text-sm font-normal">
                    High
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Include System Info */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-system-info"
              checked={includeSystemInfo}
              onCheckedChange={(checked) => setIncludeSystemInfo(checked === true)}
            />
            <Label
              htmlFor="include-system-info"
              className="cursor-pointer text-sm font-normal text-muted-foreground"
            >
              Include system info (browser, theme, screen size)
            </Label>
          </div>
          {/* Turnstile CAPTCHA */}
          <TurnstileWidget
            onVerify={setTurnstileToken}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
            className="my-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim() || !turnstileToken}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
