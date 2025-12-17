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
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"
import { ENVIRONMENTS } from "@/config/environments"
import type { EnvironmentId } from "@/types/environment"
import { useAuth } from "@/hooks/useAuth"

export function CreateScapeDialog() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

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

    setLoading(true)
    try {
      const envConfig = ENVIRONMENTS[selectedEnv]
      const templateConfig = envConfig.templates.find((t) => t.id === selectedTemplate)

      if (!templateConfig) throw new Error("Template not found")

      // Create Scape (Hybrid: New ones use UUIDs)
      const newId = crypto.randomUUID()

      await db.scapes.add({
        id: newId,
        name: name.trim(),
        environment: selectedEnv,
        template: templateConfig.id,
        source: source,
        authorId: user?.id,
        syncStatus: source === "cloud" ? "dirty" : "offline",
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
        }))
        await db.files.bulkAdd(filesToAdd)
      }

      setOpen(false)
      setName("")
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
                placeholder="My Awesome Project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Environment Selector */}
            <div className="grid gap-2">
              <Label>Environment</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.values(ENVIRONMENTS).map((env) => {
                  const Icon = env.icon
                  return (
                    <Card
                      key={env.id}
                      className={cn(
                        "flex cursor-pointer flex-col gap-2 p-3 transition-all hover:border-primary",
                        selectedEnv === env.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedEnv(env.id)}
                    >
                      <div className="w-fit rounded-md bg-background p-2 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{env.name}</div>
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
                  className={cn(
                    "relative cursor-pointer p-3 transition-all",
                    source === "cloud"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50",
                    !isAuthenticated && "opacity-70"
                  )}
                  onClick={() => {
                    if (isAuthenticated) setSource("cloud")
                    else alert("CodeScape Cloud Coming Soon")
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

            <Button type="submit" disabled={loading}>
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
