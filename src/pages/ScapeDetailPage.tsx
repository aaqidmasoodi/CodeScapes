import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    Heart,
    GitFork,
    ArrowLeft,
    Share2,
    Play,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"

import { Header } from "@/components/layout/Header"

import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { type Scape } from "@/lib/db"

// Components
import { CommentsSection } from "@/components/community/CommentsSection"
import { CodeViewer } from "@/components/community/CodeViewer"

const repo = new CloudRepository()

export default function ScapeDetailPage() {
    const { scapeId } = useParams<{ scapeId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [scape, setScape] = useState<Scape | null>(null)
    const [loading, setLoading] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [isForking, setIsForking] = useState(false)
    const [showPreview, setShowPreview] = useState(true)

    // Load Scape
    useEffect(() => {
        if (!scapeId) return
        async function load() {
            try {
                const data = await repo.getScape(scapeId!) // This uses existing getScape, returns Scape
                if (data) {
                    setScape(data)
                    // Check if liked if user exists
                    if (user) {
                        // We need a helper for checking 'isLiked' separately or toggle returns state
                        // For now assume false or fetch separately
                    }
                }
            } catch (e) {
                console.error("Failed to load scape", e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [scapeId, user])

    const handleLike = async () => {
        if (!user || !scapeId) return
        const newStatus = await repo.toggleLike(scapeId, user.id)
        setIsLiked(newStatus)
        // Optimistic update of stats?
    }

    const handleFork = async () => {
        if (!user || !scapeId) return
        try {
            setIsForking(true)
            const newId = await repo.forkScape(scapeId, user.id)
            navigate(`/scape/${newId}`) // Go to editor with new fork
        } catch (e) {
            console.error("Fork failed", e)
        } finally {
            setIsForking(false)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
    if (!scape) return <div className="flex h-screen items-center justify-center">Scape not found</div>

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Header */}
            {/* Header */}
            <Header
                showFullLogo={true}
                startContent={
                    <Button variant="ghost" size="icon" onClick={() => navigate("/community")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                }
            />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Preview */}
                <div className="flex flex-1 flex-col border-r bg-muted/10 p-6">
                    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
                        {/* Runnable Preview Area */}
                        <div className="flex flex-1 items-center justify-center bg-secondary/5 relative overflow-hidden">
                            {showPreview ? (
                                <iframe
                                    src={`/view/${scape.id}`}
                                    className="h-full w-full border-0 bg-white overflow-hidden"
                                    title="Preview"
                                    scrolling="no"
                                    style={{ overflow: "hidden" }}
                                />
                            ) : (
                                <div className="text-center">
                                    <Button
                                        size="lg"
                                        className="rounded-full h-16 w-16"
                                        variant="outline"
                                        onClick={() => setShowPreview(true)}
                                    >
                                        <Play className="ml-1 h-8 w-8" />
                                    </Button>
                                    <p className="mt-4 text-muted-foreground">Run Preview</p>
                                </div>
                            )}
                        </div>
                        {/* Code Viewer */}
                        <div className="h-1/3 border-t">
                            <CodeViewer scapeId={scape.id} />
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar Info */}
                <div className="w-80 overflow-y-auto border-l bg-background p-6">
                    <div className="space-y-6">
                        {/* Author Info - Moved Here */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold">{scape.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    by {scape.author?.name || "Unknown"}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                            <Button className="w-full" variant="outline" onClick={handleLike}>
                                <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                                {isLiked ? "Liked" : "Like"}
                            </Button>
                            <Button className="w-full" variant="outline" onClick={handleFork} disabled={isForking}>
                                <GitFork className="mr-2 h-4 w-4" />
                                {isForking ? "Forking..." : "Fork"}
                            </Button>
                            <Button className="w-full" variant="outline" onClick={() => window.open(`/view/${scape.id}`, '_blank')}>
                                <Play className="mr-2 h-4 w-4" />
                                Open App
                            </Button>
                            <Button className="w-full" variant="outline">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="font-semibold">About</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {scape.description || "No description provided."}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="secondary">{scape.environment}</Badge>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="font-bold">{scape.stats?.views || 0}</div>
                                <div className="text-xs text-muted-foreground">Views</div>
                            </div>
                            <div>
                                <div className="font-bold">{scape.stats?.likes || 0}</div>
                                <div className="text-xs text-muted-foreground">Likes</div>
                            </div>
                            <div>
                                <div className="font-bold">{scape.stats?.forks || 0}</div>
                                <div className="text-xs text-muted-foreground">Forks</div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="mb-4 font-semibold">Comments</h3>
                            <CommentsSection scapeId={scape.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
