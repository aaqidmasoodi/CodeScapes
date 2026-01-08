import { Check, XCircle, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface PlanStep {
  action: "create" | "modify" | "delete" | "run" | "command" | "browser"
  target: string
  description: string
}

export interface ScapperPlan {
  summary: string
  steps: PlanStep[]
}

interface PlanProposalProps {
  plan: ScapperPlan
  planId: string
  /**
   * Function to check if this plan has been responded to.
   * Must be a function (not a boolean) so it reads from a ref at click time,
   * not at element creation time.
   */
  checkIsResponded: () => boolean
  onResponse: (response: string, planId: string) => void
  getActionIcon: (action: string) => React.ReactNode
}

export function PlanProposal({
  plan,
  planId,
  checkIsResponded,
  onResponse,
  getActionIcon,
}: PlanProposalProps) {
  const handleResponse = (response: string) => {
    // Check ref at click time (not render time)
    if (checkIsResponded()) return
    onResponse(response, planId)
  }

  return (
    <div className="my-2 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <ClipboardList className="h-4 w-4 text-emerald-400" /> Proposed Plan
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{plan.summary}</p>
      <div className="mb-4 space-y-2">
        {plan.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5">{getActionIcon(step.action)}</span>
            <div>
              <span className="font-medium text-foreground">{step.target}</span>
              <span className="text-muted-foreground"> — {step.description}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleResponse("Yes, proceed with the plan")}
          className="bg-green-600 hover:bg-green-700"
          disabled={checkIsResponded()}
        >
          <Check className="mr-1 h-4 w-4" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResponse("No, cancel the plan")}
          disabled={checkIsResponded()}
        >
          <XCircle className="mr-1 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  )
}
