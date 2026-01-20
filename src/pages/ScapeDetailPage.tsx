import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Heart, GitFork, Share2, Play, Eye, Maximize2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/components/theme-provider"
import { Skeleton } from "@/components/ui/skeleton"

import { CloudRepository } from "@/lib/repositories/CloudRepository"
import { type Scape } from "@/lib/db"

// Components
import { CommentsSection } from "@/components/community/CommentsSection"
import { CodeViewer } from "@/components/community/CodeViewer"
import { AuthDialog } from "@/components/auth/AuthDialog"

// SEO
import { SeoHead } from "@/components/common/SeoHead"

const repo = new CloudRepository()

export default function ScapeDetailPage() {
  const { scapeId } = useParams<{ scapeId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [scape, setScape] = useState<Scape | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isForking, setIsForking] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const viewIncrementedRef = useRef(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { resolvedTheme } = useTheme()

  // Sync theme to iframe - robust version with retry
  const sendThemeToIframe = useCallback(() => {
    if (iframeRef.current?.contentWindow && resolvedTheme) {
      iframeRef.current.contentWindow.postMessage(
        { type: "THEME_CHANGE", theme: resolvedTheme },
        "*"
      )
    }
  }, [resolvedTheme])

  // Effect to send theme when it changes
  useEffect(() => {
    sendThemeToIframe()
    // Also retry after a short delay in case iframe wasn't ready
    const timeout = setTimeout(sendThemeToIframe, 100)
    return () => clearTimeout(timeout)
  }, [resolvedTheme, sendThemeToIframe])

  // Send theme when iframe loads
  const handleIframeLoad = () => {
    // Use a small delay to ensure the iframe's document is ready
    setTimeout(sendThemeToIframe, 50)
  }

  // Load Scape & Update Views
  useEffect(() => {
    if (!scapeId) return

    // Increment view count (Unique per session)
    if (!viewIncrementedRef.current) {
      const storageKey = `viewed_scape_${scapeId}`
      const hasViewed = sessionStorage.getItem(storageKey)

      if (!hasViewed) {
        repo.incrementView(scapeId).catch(console.error)
        sessionStorage.setItem(storageKey, "true")
      }
      viewIncrementedRef.current = true
    }

    async function load() {
      try {
        // Pass user ID to check like status
        const data = await repo.getScape(scapeId!, user?.id)
        if (data) {
          setScape(data)
          setIsLiked(!!data.stats?.isLiked)
        }
      } catch {
        toast({ variant: "destructive", title: "Failed to load scape details" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [scapeId, user, toast])

  const handleLike = async () => {
    if (!scapeId) return

    if (!user) {
      const { dismiss: dismissToast } = toast({
        title: "Sign in required",
        description: "You must be logged in to like a project.",
        variant: "destructive",
        action: (
          <Button
            className="border-0 bg-white text-destructive hover:bg-white/90"
            size="sm"
            onClick={() => {
              dismissToast()
              setShowAuthDialog(true)
            }}
          >
            Sign In
          </Button>
        ),
      })
      return
    }

    // Optimistic UI Update
    const previousLiked = isLiked
    const previousCount = scape?.stats?.likes || 0

    setIsLiked(!previousLiked)
    if (scape) {
      setScape({
        ...scape,
        stats: {
          ...scape.stats!,
          likes: previousLiked ? previousCount - 1 : previousCount + 1,
        },
      })
    }

    try {
      await repo.toggleLike(scapeId, user.id)
    } catch {
      // Revert on failure
      setIsLiked(previousLiked)
      if (scape) {
        setScape({
          ...scape,
          stats: {
            ...scape.stats!,
            likes: previousCount,
          },
        })
      }
      toast({ variant: "destructive", title: "Failed to update like" })
    }
  }

  const handleFork = async () => {
    if (!scapeId) return

    if (!user) {
      const { dismiss: dismissToast } = toast({
        title: "Sign in required",
        description: "You must be logged in to fork a project.",
        variant: "destructive",
        action: (
          <Button
            className="border-0 bg-white text-destructive hover:bg-white/90"
            size="sm"
            onClick={() => {
              dismissToast()
              setShowAuthDialog(true)
            }}
          >
            Sign In
          </Button>
        ),
      })
      return
    }

    try {
      setIsForking(true)
      const newId = await repo.forkScape(scapeId, user.id)
      toast({ title: "Fork created successfully!" })
      navigate(`/scape/${newId}`)
    } catch (e) {
      console.error("Fork failed", e)
      toast({ variant: "destructive", title: "Failed to fork project" })
    } finally {
      setIsForking(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Shareable link copied to clipboard.",
      })
    } catch {
      toast({ variant: "destructive", title: "Failed to copy link" })
    }
  }

  if (loading)
    return (
      <div className="flex h-full flex-col bg-background">
        {/* Skeleton Loader matching the page layout */}
        <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-6">
          <div className="mx-auto flex max-w-[1800px] flex-col gap-8">
            {/* ... (rest of skeleton is deep inside) ... */}
            {/* We can just wrap the inner content in a div instead of DashboardLayout */}
            {/* But wait, the inner content includes specific skeletons.  */}
            {/* Let's just return the wrapper div and let the inner divs assume they are in main layout */}
            {/* We need to match the previous structure roughly for the close tags to align if we don't replace the whole block */}

            {/* Top Section: Preview & Metadata */}
            <div className="grid min-h-[500px] grid-cols-1 gap-6 lg:h-[750px] lg:grid-cols-4">
              {/* Visual Preview Skeleton (3/4) */}
              <div className="flex h-[60vh] flex-col overflow-hidden rounded-xl border bg-secondary/5 shadow-sm lg:col-span-3 lg:h-full">
                <div className="flex items-center justify-between border-b px-4 py-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex-1 bg-muted/10">
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-20 w-20 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Metadata Card Skeleton (1/3) */}
              <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6 flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="col-span-2 h-10 w-full" />
                </div>

                <Separator className="my-6" />

                {/* About */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="mb-2 h-5 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="mt-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Code & Comments */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Source Code Skeleton */}
              <div className="flex h-[700px] flex-col rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>

              {/* Comments Skeleton */}
              <div className="flex h-[700px] flex-col rounded-xl border bg-card shadow-sm">
                <div className="border-b bg-muted/20 px-4 py-3">
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="space-y-6 p-4">
                  {/* Comment items */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-12" />
          </div>
        </div>
      </div>
    )
  if (!scape) return <div className="flex h-full items-center justify-center">Scape not found</div>

  const isOwner = user?.id === scape.authorId

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: scape.name,
    programmingLanguage: scape.environment === "python" ? "Python" : "JavaScript",
    author: {
      "@type": "Person",
      name: scape.author?.name || scape.author?.username || "Unknown",
    },
    dateCreated: scape.createdAt.toISOString(),
    description: scape.description,
  }

  return (
    <>
      <SeoHead
        title={`${scape.name} using ${scape.environment}`}
        description={scape.description || `Check out ${scape.name} on CodeScapes.`}
        url={`https://codescapes.io/community/scape/${scape.id}`}
        image={scape.thumbnail || undefined}
        author={scape.author?.name || scape.author?.username}
        type="article"
        jsonLd={jsonLd}
        keywords={["CodeScapes", scape.environment, "creative coding", "programming"]}
      />
      <div className="flex h-full flex-col bg-background">
        <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-6">
          <div className="mx-auto flex max-w-[1800px] flex-col gap-8">
            {/* Top Section: Preview & Metadata */}
            <div className="grid min-h-[500px] grid-cols-1 gap-6 lg:h-[750px] lg:grid-cols-4">
              {/* Visual Preview (3/4) */}
              <div className="flex h-[60vh] flex-col overflow-hidden rounded-xl border bg-secondary/5 shadow-sm lg:col-span-3 lg:h-full">
                <div className="flex items-center justify-between border-b px-4 py-2">
                  <span className="text-sm font-medium text-muted-foreground">Preview Output</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-2 text-xs"
                    onClick={() => navigate(`/view/${scape.id}`)}
                  >
                    <Maximize2 className="h-3 w-3" /> Launch Full Screen
                  </Button>
                </div>
                <div className="relative flex-1 overflow-hidden bg-white dark:bg-zinc-950">
                  {showPreview ? (
                    <iframe
                      ref={iframeRef}
                      src={`/view/${scape.id}`}
                      className="h-full w-full border-0"
                      title="Preview"
                      onLoad={handleIframeLoad}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Button
                          size="lg"
                          className="h-20 w-20 rounded-full"
                          variant="outline"
                          onClick={() => setShowPreview(true)}
                        >
                          <Play className="ml-1 h-10 w-10" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Card (1/3) */}
              <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6 flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={scape.author?.avatar} />
                    <AvatarFallback>{scape.author?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <h1 className="truncate text-xl font-bold">{scape.name}</h1>
                    <p className="truncate text-sm text-muted-foreground">
                      by{" "}
                      <Link
                        to={`/u/${scape.author?.username || scape.authorId}`}
                        className="text-foreground hover:underline"
                      >
                        {scape.author?.name || "Unknown"}
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{scape.stats?.views || 0}</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" /> Views
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{scape.stats?.likes || 0}</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" /> Likes
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{scape.stats?.forks || 0}</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <GitFork className="h-3 w-3" /> Forks
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="w-full"
                    variant={isLiked ? "secondary" : "default"}
                    onClick={handleLike}
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${isLiked ? "fill-current text-red-500" : ""}`}
                    />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleFork}
                    disabled={isForking}
                  >
                    <GitFork className="mr-2 h-4 w-4" />
                    {isForking ? "Forking..." : "Fork"}
                  </Button>
                  <Button className="col-span-2 w-full" variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Project
                  </Button>

                  {isOwner && (
                    <Button
                      className="col-span-2 w-full"
                      variant="secondary"
                      onClick={() => navigate(`/scape/${scape.id}`)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Open in Editor
                    </Button>
                  )}
                </div>

                <Separator className="my-6" />

                {/* About */}
                <div className="flex-1 overflow-y-auto">
                  <h3 className="mb-2 font-semibold">About</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {scape.description || "No description provided."}
                  </p>
                  <div className="mt-4">
                    <Badge variant="secondary" className="capitalize">
                      {scape.environment}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Code & Comments */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Source Code */}
              <div className="flex h-[700px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Source Code</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      Read-only
                    </Badge>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeViewer scapeId={scape.id} />
                </div>
              </div>

              {/* Comments */}
              <div className="flex h-[700px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="border-b bg-muted/20 px-4 py-3">
                  <h3 className="font-semibold">Comments & Discussion</h3>
                </div>
                <div className="flex-1 overflow-hidden">
                  <CommentsSection scapeId={scape.id} onSignIn={() => setShowAuthDialog(true)} />
                </div>
              </div>
            </div>

            {/* Bottom Spacer */}
            <div className="h-12" />
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  )
}
