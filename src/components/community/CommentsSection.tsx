import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/text-area"


const repo = new CloudRepository()

export function CommentsSection({ scapeId }: { scapeId: string }) {
    const { user } = useAuth()
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadComments()
    }, [scapeId])

    async function loadComments() {
        try {
            const data = await repo.getComments(scapeId)
            setComments(data)
        } catch {
            // ignore
        }
    }

    async function handleSubmit() {
        if (!user || !newComment.trim()) return
        setLoading(true)
        try {
            await repo.addComment(scapeId, user.id, newComment)
            setNewComment("")
            loadComments() // Reload
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* List */}
            <div className="space-y-4">
                {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{c.author?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium">{c.author?.email || "User"}</p>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-foreground">{c.content}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">No comments yet.</p>
                )}
            </div>

            {/* Input */}
            {user ? (
                <div className="space-y-2">
                    <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <Button size="sm" onClick={handleSubmit} disabled={loading || !newComment.trim()}>
                        {loading ? "Posting..." : "Post Comment"}
                    </Button>
                </div>
            ) : (
                <div className="rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
                    Sign in to leave a comment.
                </div>
            )}
        </div>
    )
}
