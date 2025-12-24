import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Laptop, Cloud, Lock, Layout, Box, Paintbrush, Code2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ENVIRONMENTS } from "@/config/environments"
import type { EnvironmentId } from "@/types/environment"
import { useAuth } from "@/hooks/useAuth"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"

export function CreateScapeDialog() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const [selectedEnv, setSelectedEnv] = useState<EnvironmentId>("web")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank")

  const [source, setSource] = useState<"local" | "cloud">("local")
  const [loading, setLoading] = useState(false)

  // Real Auth
  const { user } = useAuth()
  const isAuthenticated = !!user

  // Reset template when env changes
  useEffect(() => {
    const templates = ENVIRONMENTS[selectedEnv].templates
    if (templates.length > 0) {
      setSelectedTemplate(templates[0].id)
    }
  }, [selectedEnv])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      setError("Invalid name format")
      return
    }
    if (name.length > 25) {
      setError("Name must be 25 characters or less")
      return
    }

    setLoading(true)
    try {
      const envConfig = ENVIRONMENTS[selectedEnv]
      const templateConfig = envConfig.templates.find((t) => t.id === selectedTemplate)

      if (!templateConfig) throw new Error("Template not found")

      // Create Scape (Hybrid: New ones use UUIDs)
      const newId = crypto.randomUUID()

      const repo = source === "cloud" ? new CloudRepository() : new LocalRepository()

      await repo.saveScape({
        id: newId,
        name: name.trim(),
        environment: selectedEnv,
        template: templateConfig.id,
        source: source,
        authorId: user?.id,
        syncStatus: source === "cloud" ? "synced" : "offline",
        dependencies: templateConfig.dependencies || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Add default files from template
      if (templateConfig.files) {
        const filesToAdd = templateConfig.files.map((f) => ({
          id: crypto.randomUUID(),
          scapeId: newId,
          name: f.name,
          content: f.content,
          language: f.language || "plaintext",
        })) as (import("@/types/file").ScapeFile & { scapeId: string })[] // Cast to satisfy repo interface

        await repo.bulkCreateFiles(filesToAdd)
      }

      setOpen(false)
      setName("")
      setError("")
      // Redirect using the new ID (string)
      navigate(`/scape/${newId}`)

      // Reset form
      setName("")
      setSource("local")
      // Env/Template reset not strictly needed but good practice
    } catch (error) {
      console.error("Failed to create scape:", error)
      alert("Failed to create scape. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Helper for Template Icons (Optional visual flair)
  const getTemplateIcon = (id: string) => {
    if (id === "threejs") return <Box className="h-5 w-5" />
    if (id === "p5") return <Paintbrush className="h-5 w-5" />
    if (id === "videogame") return <Code2 className="h-5 w-5" />
    return <Layout className="h-5 w-5" />
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Scape
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[650px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Scape</DialogTitle>
            <DialogDescription>
              Select an environment and template to start your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="name">Scape Name</Label>
              <Input
                id="name"
                placeholder="My Project"
                value={name}
                maxLength={25}
                onChange={(e) => {
                  const val = e.target.value
                  setName(val)
                  if (val && !/^[a-zA-Z0-9 ]+$/.test(val)) {
                    setError("Only letters, numbers, and spaces allowed.")
                  } else if (val.length > 25) {
                    setError("Name must be 25 characters or less")
                  } else {
                    setError("")
                  }
                }}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                required
              />
              <p className="text-xs text-muted-foreground">{name.length}/25</p>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            {/* Environment Selector */}
            <div className="grid gap-2">
              <Label>Environment</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.values(ENVIRONMENTS).map((env) => {
                  const Icon = env.icon
                  const isFlowScape = env.id === "flowscape"
                  const isLocked = isFlowScape && !isAuthenticated
                  return (
                    <Card
                      key={env.id}
                      title={isLocked ? "Sign in to access FlowScape" : undefined}
                      className={cn(
                        "relative flex flex-col gap-2 p-3 transition-all",
                        selectedEnv === env.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted/50",
                        isLocked
                          ? "cursor-not-allowed opacity-70"
                          : "cursor-pointer hover:border-primary"
                      )}
                      onClick={() => {
                        if (!isLocked) setSelectedEnv(env.id)
                      }}
                    >
                      {isLocked && (
                        <div className="absolute right-2 top-2">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <div className="w-fit rounded-md bg-background p-2 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                          {env.name}
                          {isFlowScape && (
                            <Badge variant="secondary" className="h-4 px-1 py-0 text-[9px]">
                              Beta
                            </Badge>
                          )}
                        </div>
                        <div className="line-clamp-2 text-[10px] text-muted-foreground">
                          {env.description}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Template Selector */}
            <div className="grid gap-2">
              <Label>Starting Template</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                {ENVIRONMENTS[selectedEnv].templates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(
                      "cursor-pointer p-3 transition-all hover:border-primary",
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-background p-2 shadow-sm">
                        {getTemplateIcon(template.id)}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{template.name}</div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Location Selector */}
            <div className="grid gap-2">
              <Label>Storage Location</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={cn(
                    "cursor-pointer p-3 transition-all hover:border-primary",
                    source === "local"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSource("local")}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-background p-2 shadow-sm">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">Local Device</div>
                      <div className="text-[10px] text-muted-foreground">Saved to browser</div>
                    </div>
                  </div>
                </Card>

                <Card
                  title={!isAuthenticated ? "Sign in to use Cloud Storage" : undefined}
                  className={cn(
                    "relative p-3 transition-all",
                    source === "cloud"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50",
                    !isAuthenticated ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                  )}
                  onClick={() => {
                    if (isAuthenticated) setSource("cloud")
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-background p-2 shadow-sm">
                      <Cloud className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">CodeScape Cloud</div>
                      <div className="text-[10px] text-muted-foreground">Sync across devices</div>
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <div className="absolute right-2 top-2">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={loading || !!error || !name}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Scape"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
