import { useState } from "react"
import { Rocket, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CloudRepository } from "@/lib/repositories/CloudRepository"

interface DeployButtonProps {
    scapeId: string
    isOwner: boolean
    isCloud: boolean
    onDeploy?: (deploymentId: string) => void
}

export function DeployButton({ scapeId, isOwner, isCloud, onDeploy }: DeployButtonProps) {
    const [isDeploying, setIsDeploying] = useState(false)
    const { toast } = useToast()
    const repo = new CloudRepository()

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
        <Button
            size="sm"
            variant="default" // Primary action
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleDeploy}
            disabled={isDeploying}
            title="Publish a snapshot to the Community"
        >
            {isDeploying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Rocket className="h-4 w-4" />
            )}
            {isDeploying ? "Publishing..." : "Deploy"}
        </Button>
    )
}
