import { useState, useEffect, useCallback } from "react"
import { Share2, UserPlus, X, Loader2, Copy, Check } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { collaboratorsService } from "@/services/collaborators"
import type { Collaborator } from "@/types/collaborator"

interface ShareModalProps {
    scapeId: string
    scapeName: string
    isOwner: boolean
}

export function ShareModal({ scapeId, scapeName, isOwner }: ShareModalProps) {
    const [open, setOpen] = useState(false)
    const [collaborators, setCollaborators] = useState<Collaborator[]>([])
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [adding, setAdding] = useState(false)
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    const liveUrl = `${window.location.origin}/live/${scapeId}`

    const loadCollaborators = useCallback(async () => {
        if (!isOwner) return
        try {
            setLoading(true)
            const data = await collaboratorsService.getCollaborators(scapeId)
            setCollaborators(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [scapeId, isOwner])

    useEffect(() => {
        if (open && isOwner) {
            loadCollaborators()
        }
    }, [open, isOwner, loadCollaborators])

    const handleAddCollaborator = async () => {
        if (!email.trim()) return

        try {
            setAdding(true)
            const collab = await collaboratorsService.addCollaboratorByEmail(scapeId, email.trim())
            setCollaborators((prev) => [collab, ...prev])
            setEmail("")
            toast({ title: `Added ${email} as collaborator` })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to add collaborator",
                description: error.message,
            })
        } finally {
            setAdding(false)
        }
    }

    const handleRemove = async (collab: Collaborator) => {
        try {
            await collaboratorsService.removeCollaborator(collab.id)
            setCollaborators((prev) => prev.filter((c) => c.id !== collab.id))
            toast({ title: "Collaborator removed" })
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to remove" })
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(liveUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ title: "Link copied!" })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share "{scapeName}"</DialogTitle>
                    <DialogDescription>
                        {isOwner
                            ? "Add collaborators who can run this scape with your secrets."
                            : "Only the owner can manage collaborators."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Copy Link Section */}
                    <div className="flex items-center gap-2">
                        <Input value={liveUrl} readOnly className="flex-1 text-xs" />
                        <Button variant="outline" size="icon" onClick={handleCopyLink}>
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>

                    {isOwner && (
                        <>
                            {/* Add Collaborator */}
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="collaborator@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddCollaborator()}
                                    className="flex-1"
                                />
                                <Button onClick={handleAddCollaborator} disabled={adding || !email.trim()}>
                                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                </Button>
                            </div>

                            {/* Collaborators List */}
                            <div className="max-h-48 space-y-2 overflow-auto">
                                {loading ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : collaborators.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        No collaborators yet
                                    </p>
                                ) : (
                                    collaborators.map((collab) => (
                                        <div
                                            key={collab.id}
                                            className="flex items-center justify-between rounded-md border px-3 py-2"
                                        >
                                            <span className="text-sm">{collab.email || collab.user_id.slice(0, 8)}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemove(collab)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                ⚠️ Collaborators can run this scape with your secrets. Only add people you trust.
                            </p>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
