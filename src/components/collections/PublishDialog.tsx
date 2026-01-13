import { useState } from "react"
import { Rocket, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "../ui/progress"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { toast } from "sonner"

interface ScapeInfo {
  id: string
  name: string
}

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  undeployedScapes: ScapeInfo[]
  onConfirm: () => void
}

export function PublishDialog({
  open,
  onOpenChange,
  undeployedScapes,
  onConfirm,
}: PublishDialogProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const handleDeployAll = async () => {
    setIsDeploying(true)
    setProgress(0)
    setCompletedIds(new Set())
    const repo = new CloudRepository()

    try {
      let successCount = 0
      for (const scape of undeployedScapes) {
        try {
          await repo.deployScape(scape.id)
          setCompletedIds((prev) => new Set(prev).add(scape.id))
          successCount++
        } catch (error) {
          console.error(`Failed to deploy ${scape.name}:`, error)
          toast.error(`Failed to deploy ${scape.name}`)
        }
        setProgress(((successCount + 1) / undeployedScapes.length) * 100)
      }

      if (successCount === undeployedScapes.length) {
        toast.success("All scapes deployed successfully")
        onConfirm() // Proceed with publishing
        onOpenChange(false)
      } else {
        toast.warning(`Deployed ${successCount} of ${undeployedScapes.length} scapes`)
        // Ensure user knows they might need to retry or check manually
        // We still close if at least some succeeded? Or let them retry?
        // Let's keep it open if failures occurred so they can see.
        if (successCount > 0) {
          // Maybe allow force publish? For now, just stop.
        }
      }
    } catch (e) {
      console.error(e)
      toast.error("Batch deployment failed")
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isDeploying ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Undeployed Scapes Detected
          </DialogTitle>
          <DialogDescription>
            This collection contains <strong>{undeployedScapes.length}</strong> scapes that haven't
            been deployed yet. Public collections must have deployed scapes to be visible to others.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h4 className="mb-2 text-sm font-medium">Scapes to Deploy:</h4>
          <ScrollArea className="h-[150px] rounded-md border bg-muted/20 p-2">
            <div className="space-y-1">
              {undeployedScapes.map((scape) => (
                <div
                  key={scape.id}
                  className="flex items-center justify-between rounded px-2 py-1.5 text-sm"
                >
                  <span className="truncate text-muted-foreground">{scape.name}</span>
                  {completedIds.has(scape.id) ? (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <CheckCircle2 className="h-3 w-3" /> Deployed
                    </span>
                  ) : isDeploying ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      Pending...
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {isDeploying && (
          <div className="space-y-1 px-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Deploying...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeploying}>
            Cancel
          </Button>
          <Button onClick={handleDeployAll} disabled={isDeploying} className="gap-2">
            {isDeploying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            {isDeploying ? "Deploying..." : "Deploy & Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
