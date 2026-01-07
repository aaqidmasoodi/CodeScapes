import { useState } from "react"
import { Check, XCircle } from "lucide-react"
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
  onResponse: (response: string) => void
  getActionIcon: (action: string) => React.ReactNode
}

export function PlanProposal({ plan, onResponse, getActionIcon }: PlanProposalProps) {
  const [hasResponded, setHasResponded] = useState(false)

  const handleResponse = (response: string) => {
    if (hasResponded) return
    setHasResponded(true)
    onResponse(response)
  }

  return (
    <div className="my-2 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 font-semibold text-foreground">📋 Proposed Plan</div>
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
          disabled={hasResponded}
        >
          <Check className="mr-1 h-4 w-4" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResponse("No, cancel the plan")}
          disabled={hasResponded}
        >
          <XCircle className="mr-1 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  )
}
