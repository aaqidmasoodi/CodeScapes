import { useState, useEffect } from "react"
import { Rocket, Loader2, History, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CloudRepository } from "@/lib/repositories/CloudRepository"

interface DeploymentDialogProps {
  scapeId: string
  isOwner: boolean
  isCloud: boolean
  onDeploy?: (deploymentId: string) => void
}

export function DeploymentDialog({ scapeId, isOwner, isCloud, onDeploy }: DeploymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const { toast } = useToast()
  const repo = new CloudRepository()

  const loadHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const data = await repo.getDeployments(scapeId)
      setDeployments(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (isOpen && isCloud) {
      loadHistory()
    }
  }, [isOpen, isCloud, scapeId])

  const handleDeploy = async () => {
    if (!isOwner || !isCloud) return
    setIsDeploying(true)
    try {
      const deploymentId = await repo.deployScape(scapeId)
      toast({
        title: "Deployment Successful",
        description: "Your scape has been published to the community.",
      })
      if (onDeploy) onDeploy(deploymentId)
      loadHistory() // Refresh list
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: error.message || "Could not publish scape.",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  if (!isCloud || !isOwner) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="gap-2 bg-green-600 text-white hover:bg-green-700"
        >
          <Rocket className="h-4 w-4" />
          Deploy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deployments</DialogTitle>
          <DialogDescription>
            Manage your published versions. Deploying creates a snapshot available to the community.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Deploy Action */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Deploy New Version</h4>
              <p className="text-xs text-muted-foreground">Snapshot current files and publish.</p>
            </div>
            <Button onClick={handleDeploy} disabled={isDeploying} size="sm">
              {isDeploying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}
              Deploy
            </Button>
          </div>

          {/* History List */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4" /> History
            </h4>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {isLoadingHistory ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : deployments.length === 0 ? (
                <p className="p-4 text-center text-xs text-muted-foreground">No deployments yet.</p>
              ) : (
                <div className="space-y-2">
                  {deployments.map((dep, i) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                          v{dep.version}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {i === 0 ? "Latest Version" : `Version ${dep.version}`}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />{" "}
                            {new Date(dep.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {i === 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          Active
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
