import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CloudRepository } from "@/lib/repositories/CloudRepository"
import type { Scape } from "@/lib/db"
import { ProfileScapeCard } from "@/components/profile/ProfileScapeCard"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  BookOpen,
  Link as LinkIcon,
  MapPin,
  Rocket,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BadgeBuilder, BadgeEarlyAdopter, BadgeTopContributor } from "@/components/profile/Badges"
import { useAuth } from "@/hooks/useAuth"
const repo = new CloudRepository()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserProfile = any

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [scapes, setScapes] = useState<Scape[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  // Show 2 rows worth of items initially (estimate ~5 items per row on average)
  const COLLAPSED_ITEMS = 10

  useEffect(() => {
    async function load() {
      if (!username) return
      setLoading(true)
      try {
        const user = await repo.getProfile(username)
        if (user) {
          setProfile(user)
          // Fetch public scapes
          const userScapes = await repo.getUserScapes(user.id)
          setScapes(userScapes)
        } else {
          console.warn("User not found:", username)
        }
      } catch (e) {
        console.error("Failed to load profile:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6 md:p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left Column Skeleton */}
          <div className="w-full shrink-0 md:w-64 lg:w-72">
            <div className="space-y-6">
              <Skeleton className="h-40 w-40 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          {/* Right Column Skeleton */}
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-6 h-10 w-72 rounded-lg" />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Users className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">The user you are looking for does not exist.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left Column: Profile Info (fixed width) */}
        <div className="w-full shrink-0 md:w-64 lg:w-72">
          <div className="space-y-6 md:sticky md:top-0">
            <div className="group relative">
              <Avatar className="h-40 w-40 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-4xl">
                  {profile.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-bold leading-none">{profile.full_name}</h1>
              <p className="text-xl text-muted-foreground">@{profile.username}</p>
            </div>

            {profile.bio && <p className="text-base text-foreground/80">{profile.bio}</p>}

            <div className="space-y-2 text-sm text-muted-foreground">
              {profile.company && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {/* ... other profile fields ... */}
              {profile.website && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <BadgeEarlyAdopter />
                <BadgeBuilder />
                <BadgeTopContributor />
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-semibold text-foreground">0</span> followers
                <span className="mx-1">·</span>
                <span className="font-semibold text-foreground">0</span> following
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content (flex grow) */}
        <div className="min-w-0 flex-1">
          <Tabs defaultValue="public" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="public" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Public Scapes
                  <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {scapes.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="deployments" className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Deployments
                  <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {scapes.filter((s) => !!s.published_version_id).length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="public" className="mt-0">
              {scapes.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                    {(expanded ? scapes : scapes.slice(0, COLLAPSED_ITEMS)).map((scape) => (
                      <ProfileScapeCard
                        key={scape.id}
                        scape={scape}
                        onClick={() => {
                          if (scape.published_version_id) {
                            navigate(`/community/scape/${scape.id}`)
                          }
                        }}
                        onFork={async () => {
                          if (!user) {
                            alert("Please sign in to fork this scape.")
                            return
                          }
                          try {
                            const newId = await repo.forkScape(scape.id, user.id)
                            navigate(`/s/${newId}`)
                          } catch (e) {
                            console.error("Failed to fork scape:", e)
                            alert("Failed to fork scape. Please try again.")
                          }
                        }}
                      />
                    ))}
                  </div>
                  {scapes.length > COLLAPSED_ITEMS && (
                    <Button
                      variant="ghost"
                      className="mt-4 w-full text-muted-foreground hover:text-foreground"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" /> Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" /> Show All {scapes.length} Scapes
                        </>
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  This user hasn't published any scapes yet.
                </div>
              )}
            </TabsContent>

            <TabsContent value="deployments" className="mt-0">
              {scapes.filter((s) => !!s.published_version_id).length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                  {scapes
                    .filter((s) => !!s.published_version_id)
                    .map((scape) => (
                      <ProfileScapeCard
                        key={scape.id}
                        scape={scape}
                        onClick={() => {
                          navigate(`/community/scape/${scape.id}`)
                        }}
                        onFork={async () => {
                          if (!user) {
                            alert("Please sign in to fork this scape.")
                            return
                          }
                          try {
                            const newId = await repo.forkScape(scape.id, user.id)
                            navigate(`/s/${newId}`)
                          } catch (e) {
                            console.error("Failed to fork scape:", e)
                            alert("Failed to fork scape. Please try again.")
                          }
                        }}
                      />
                    ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                  No deployments found.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
