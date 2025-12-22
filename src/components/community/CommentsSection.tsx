import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/text-area"
import { MessageSquare, Send, Reply, X, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const repo = new CloudRepository()

interface Comment {
  id: string
  content: string
  created_at: string
  author_id: string
  author: {
    name: string
    avatar?: string
  }
  parent_id: string | null
  children?: Comment[]
}

// Recursive Comment Component
function CommentItem({
  comment,
  level = 0,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: Comment
  level?: number
  currentUserId?: string
  onReply: (comment: Comment) => void
  onDelete: (commentId: string) => void
}) {
  if (level > 6) return null // Prevent infinite nesting depth issues

  const isAuthor = currentUserId && comment.author_id === currentUserId

  return (
    <div
      className={`group flex gap-3 ${level > 0 ? "ml-2 mt-4 border-l-2 border-muted/50 pl-4" : "py-4 first:pt-0"}`}
    >
      <Avatar className="mt-1 h-8 w-8 shrink-0 border">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback className="bg-muted text-xs">
          {comment.author.name[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {comment.content}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>

          {isAuthor && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground opacity-0 transition-colors hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>

        {/* Render Recursive Children */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2">
            {comment.children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                level={level + 1}
                currentUserId={currentUserId}
                onReply={onReply}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ... imports remain the same

// Skipping CommentItem definition as it hasn't changed logic-wise, assuming it's above or I can just target CommentsSection.
// Wait, I am replacing the file content, better be safe and include imports.

export function CommentsSection({ scapeId }: { scapeId: string }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [loading, setLoading] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadComments = useCallback(async () => {
    try {
      const flatData = (await repo.getComments(scapeId)) as unknown as Comment[]
      const tree = buildTree(flatData)
      setComments(tree)
    } catch {
      // ignore
    }
  }, [scapeId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  function buildTree(flat: Comment[]): Comment[] {
    const root: Comment[] = []
    const map = new Map<string, Comment>()

    // 1. Initialize Map
    flat.forEach((c) => {
      map.set(c.id, { ...c, children: [] })
    })

    // 2. Build Hierarchy
    flat.forEach((c) => {
      const comment = map.get(c.id)!
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id)!.children!.push(comment)
      } else {
        root.push(comment)
      }
    })

    return root
  }

  async function handleSubmit() {
    if (!user || !newComment.trim()) return
    setLoading(true)
    try {
      await repo.addComment(scapeId, user.id, newComment, replyTo?.id)
      setNewComment("")
      setReplyTo(null)
      loadComments()
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "Failed to post comment" })
    } finally {
      setLoading(false)
    }
  }

  function initiateDelete(commentId: string) {
    setItemToDelete(commentId)
  }

  async function confirmDelete() {
    if (!itemToDelete) return
    try {
      await repo.deleteComment(itemToDelete)
      toast({ title: "Comment deleted" })
      loadComments()
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "Failed to delete comment" })
    } finally {
      setItemToDelete(null)
    }
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id}>
              <CommentItem
                comment={c}
                currentUserId={user?.id}
                onReply={setReplyTo}
                onDelete={initiateDelete}
              />
              <div className="my-4 h-px bg-border/40 last:hidden" />
            </div>
          ))}

          {comments.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <div className="mb-3 rounded-full bg-muted/50 p-3">
                <MessageSquare className="h-6 w-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs">Be the first to start the discussion!</p>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-muted/10 p-4">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-md bg-secondary/20 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Replying to{" "}
              <span className="font-semibold text-foreground">{replyTo.author.name}</span>
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {user ? (
          <div className="flex gap-3">
            <Avatar className="hidden h-8 w-8 sm:block">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] w-full resize-none border-0 bg-background shadow-sm ring-1 ring-border focus-visible:ring-1"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={loading || !newComment.trim()}
                  className="gap-2"
                >
                  {loading ? (
                    "Posting..."
                  ) : (
                    <>
                      Post {replyTo ? "Reply" : "Comment"} <Send className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-muted/20 py-6 text-center">
            <p className="text-sm text-muted-foreground">Log in to join the conversation</p>
            <Button variant="outline" size="sm" asChild>
              <span>Sign in</span>
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment from the
              discussion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
