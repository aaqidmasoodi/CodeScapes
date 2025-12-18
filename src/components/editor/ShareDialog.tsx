import { useState } from "react"
import { Copy, Globe, Loader2, Share2, CloudUpload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Scape } from "@/lib/db"
import { useAuth } from "@/hooks/useAuth"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { useToast } from "@/components/ui/use-toast"

interface ShareDialogProps {
  scape: Scape
  onSyncComplete?: (updatedScape: Scape) => void
}

export function ShareDialog({ scape, onSyncComplete }: ShareDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [copied, setCopied] = useState(false)

  // URL is based on the unified runner route
  const shareUrl = `${window.location.origin}/live/${scape.id}`
  const isCloud = scape.source === "cloud"

  const handleSync = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to share projects.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)
    try {
      const localRepo = new LocalRepository()
      const cloudRepo = new CloudRepository()

      // 1. Get full local snapshot
      const files = await localRepo.getFiles(scape.id)

      // 2. Prepare Cloud Scape Object
      const cloudScape: Scape = {
        ...scape,
        source: "cloud",
        authorId: user.id,
        syncStatus: "synced",
        updatedAt: new Date(),
        // Default to private on first sync
        is_public: false,
      }

      // 3. Upload Scape Metadata
      await cloudRepo.saveScape(cloudScape)

      // 4. Upload Files (Bulk)
      await cloudRepo.deleteFile(scape.id)

      await cloudRepo.bulkCreateFiles(files.map((f) => ({ ...f, scapeId: scape.id })))

      // 5. Update Local Status
      await localRepo.updateScape(scape.id, {
        source: "cloud",
        syncStatus: "synced",
        authorId: user.id,
        cloudId: scape.id,
        is_public: false,
      })

      toast({
        title: "Synced to Cloud",
        description: "Your project is now safe in the cloud and ready to share.",
      })

      if (onSyncComplete) onSyncComplete(cloudScape)
    } catch (error) {
      console.error(error)
      toast({
        title: "Sync Failed",
        description: "Could not upload project to the cloud.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            {isCloud
              ? "Your project is available on the web."
              : "Sync your project to the cloud to generate a shareable link."}
          </DialogDescription>
        </DialogHeader>

        {isCloud ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={shareUrl}
                  readOnly
                  className="h-9 font-mono text-xs"
                  value={shareUrl}
                />
              </div>
              <Button type="submit" size="sm" onClick={handleCopy} className="px-3">
                {copied ? (
                  <span className="text-green-500">Copied</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="rounded-md bg-muted p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  <span>Public Access</span>
                </div>
                <Switch
                  checked={scape.is_public}
                  onCheckedChange={async (checked) => {
                    // Toggle public status
                    try {
                      const repo = new CloudRepository()
                      await repo.updateScape(scape.id, { is_public: checked })

                      // Optimistic toast
                      toast({ title: checked ? "Project is now Public" : "Project is now Private" })

                      // Callback to update parent state
                      if (onSyncComplete) onSyncComplete({ ...scape, is_public: checked })
                    } catch {
                      toast({ title: "Failed to update visibility", variant: "destructive" })
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {scape.is_public
                  ? "Anyone with the link can run this project."
                  : "Only you can run this project. The link will not work for others."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <CloudUpload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Sync Required</h4>
              <p className="text-xs text-muted-foreground">
                This project lives on your device. Upload it to the CodeScape Cloud to share it with
                the world.
              </p>
            </div>
            <Button onClick={handleSync} disabled={isSyncing} className="w-full">
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync & Share"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
