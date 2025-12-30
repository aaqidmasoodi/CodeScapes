import { useState, useEffect, useCallback } from "react"
import { Copy, Globe, Loader2, Share2, CloudUpload, UserPlus, X, Users } from "lucide-react"

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
import { collaboratorsService } from "@/services/collaborators"
import type { Collaborator } from "@/types/collaborator"
import { supabase } from "@/lib/supabase"

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

  // Optimistic UI state - initialized with prop but will be refreshed from DB
  const [isPublic, setIsPublic] = useState(scape.is_public ?? false)

  // Fetch fresh is_public from Supabase when dialog opens (for cloud scapes)
  // This ensures we bypass any stale local IndexedDB data
  useEffect(() => {
    if (!isOpen || scape.source !== "cloud") return

    const fetchFreshPublicState = async () => {
      try {
        const { data, error } = await supabase
          .from("scapes")
          .select("is_public")
          .eq("id", scape.id)
          .single()

        if (!error && data) {
          setIsPublic(data.is_public ?? false)
        }
      } catch (e) {
        console.error("Failed to fetch fresh is_public state", e)
      }
    }

    fetchFreshPublicState()
  }, [isOpen, scape.id, scape.source])

  // Collaborators state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [collabLoading, setCollabLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [adding, setAdding] = useState(false)

  const shareUrl = `${window.location.origin}/live/${scape.id}`
  const isCloud = scape.source === "cloud"
  const isOwner = user?.id === scape.authorId

  const loadCollaborators = useCallback(async () => {
    if (!isCloud || !isOwner) return
    try {
      setCollabLoading(true)
      const data = await collaboratorsService.getCollaborators(scape.id)
      setCollaborators(data)
    } catch (error) {
      console.error(error)
    } finally {
      setCollabLoading(false)
    }
  }, [scape.id, isCloud, isOwner])

  useEffect(() => {
    if (isOpen && isCloud && isOwner) {
      loadCollaborators()
    }
  }, [isOpen, isCloud, isOwner, loadCollaborators])

  const handleAddCollaborator = async () => {
    if (!email.trim()) return

    try {
      setAdding(true)
      const collab = await collaboratorsService.addCollaboratorByEmail(scape.id, email.trim())
      setCollaborators((prev) => [collab, ...prev])
      setEmail("")
      toast({ title: `Added ${email} as collaborator` })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      toast({
        variant: "destructive",
        title: "Failed to add collaborator",
        description: message,
      })
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveCollaborator = async (collab: Collaborator) => {
    try {
      await collaboratorsService.removeCollaborator(collab.id)
      setCollaborators((prev) => prev.filter((c) => c.id !== collab.id))
      toast({ title: "Collaborator removed" })
    } catch {
      toast({ variant: "destructive", title: "Failed to remove" })
    }
  }

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

      const files = await localRepo.getFiles(scape.id)

      const cloudScape: Scape = {
        ...scape,
        source: "cloud",
        authorId: user.id,
        syncStatus: "synced",
        updatedAt: new Date(),
        is_public: false,
      }

      await cloudRepo.saveScape(cloudScape)
      await cloudRepo.deleteFile(scape.id)
      await cloudRepo.bulkCreateFiles(files.map((f) => ({ ...f, scapeId: scape.id })))

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
    toast({ title: "Link Copied" })
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
            {/* Copy Link */}
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input id="link" value={shareUrl} readOnly className="h-9 font-mono text-xs" />
              </div>
              <Button type="submit" size="sm" onClick={handleCopy} className="px-3">
                {copied ? (
                  <span className="text-green-500">Copied</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Public Access Toggle */}
            <div className="rounded-md bg-muted p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  <span>Public Access</span>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={async (checked) => {
                    setIsPublic(checked)
                    try {
                      const repo = new CloudRepository()
                      await repo.updateScape(scape.id, { is_public: checked })
                      toast({ title: checked ? "Project is now Public" : "Project is now Private" })
                      if (onSyncComplete) onSyncComplete({ ...scape, is_public: checked })
                    } catch {
                      setIsPublic(!checked)
                      toast({ title: "Failed to update visibility", variant: "destructive" })
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? "Anyone with the link can run this project."
                  : "Only you and collaborators can run this project."}
              </p>
            </div>

            {/* Collaborators Section */}
            {isOwner && (
              <div className="rounded-md border p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  <span>Collaborators</span>
                </div>

                {/* Add Collaborator */}
                <div className="mb-3 flex items-center gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCollaborator()}
                    className="h-8 flex-1 text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddCollaborator}
                    disabled={adding || !email.trim()}
                  >
                    {adding ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserPlus className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* List */}
                <div className="max-h-32 space-y-1 overflow-auto">
                  {collabLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : collaborators.length === 0 ? (
                    <p className="py-2 text-center text-xs text-muted-foreground">
                      No collaborators yet
                    </p>
                  ) : (
                    collaborators.map((collab) => (
                      <div
                        key={collab.id}
                        className="flex items-center justify-between rounded border px-2 py-1"
                      >
                        <span className="text-xs">
                          {collab.email || collab.user_id.slice(0, 8)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          onClick={() => handleRemoveCollaborator(collab)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  ⚠️ Collaborators can run with your secrets.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <CloudUpload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Sync Required</h4>
              <p className="text-xs text-muted-foreground">
                This project lives on your device. Upload it to the CodeScape Cloud to share it.
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
