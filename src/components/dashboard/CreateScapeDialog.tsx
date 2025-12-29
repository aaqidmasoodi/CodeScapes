import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Laptop,
  Cloud,
  Lock,
  Layout,
  Box,
  Paintbrush,
  Code2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ENVIRONMENTS } from "@/config/environments"
import type { EnvironmentId } from "@/types/environment"
import { useAuth } from "@/hooks/useAuth"
import { LocalRepository } from "@/lib/repositories/LocalRepository"
import { CloudRepository } from "@/lib/repositories/CloudRepository"

const STEPS = [
  { id: 1, title: "Environment", description: "Choose your coding environment" },
  { id: 2, title: "Template", description: "Pick a starting template" },
  { id: 3, title: "Storage", description: "Where to save your project" },
  { id: 4, title: "Details", description: "Name and describe your project" },
]

export function CreateScapeDialog() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Step state
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [nameError, setNameError] = useState("")
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentId>("python")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank")
  const [source, setSource] = useState<"local" | "cloud">("local")
  const [loading, setLoading] = useState(false)

  // Auth
  const { user } = useAuth()
  const isAuthenticated = !!user

  // Browser Detection
  const isSafariOrIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      (/Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent) &&
        !/Chromium/.test(navigator.userAgent)))

  // Auto-switch to Python on Safari/iOS if an invalid env is selected
  useEffect(() => {
    if (isSafariOrIOS && (selectedEnv === "web" || selectedEnv === "flowscape")) {
      setSelectedEnv("python")
    }
  }, [isSafariOrIOS, selectedEnv])

  // Reset template when env changes
  useEffect(() => {
    const templates = ENVIRONMENTS[selectedEnv]?.templates
    if (templates && templates.length > 0) {
      setSelectedTemplate(templates[0].id)
    }
  }, [selectedEnv])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      setName("")
      setDescription("")
      setNameError("")
      setSelectedEnv("python")
      setSelectedTemplate("blank")
      setSource("local")
    }
  }, [open])

  const handleSubmit = async () => {
    if (!name.trim()) return
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      setNameError("Invalid name format")
      return
    }

    setLoading(true)
    try {
      const envConfig = ENVIRONMENTS[selectedEnv]
      const templateConfig = envConfig.templates.find((t) => t.id === selectedTemplate)

      if (!templateConfig) throw new Error("Template not found")

      const newId = crypto.randomUUID()
      const repo = source === "cloud" ? new CloudRepository() : new LocalRepository()

      await repo.saveScape({
        id: newId,
        name: name.trim(),
        description: description.trim() || undefined,
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
        })) as (import("@/types/file").ScapeFile & { scapeId: string })[]

        await repo.bulkCreateFiles(filesToAdd)
      }

      setOpen(false)
      navigate(`/scape/${newId}`)
    } catch (error) {
      console.error("Failed to create scape:", error)
      alert("Failed to create scape. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedEnv
      case 2:
        return !!selectedTemplate
      case 3:
        return !!source
      case 4:
        return name.trim().length > 0 && !nameError
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Helper for Template Icons
  const getTemplateIcon = (id: string) => {
    if (id === "threejs") return <Box className="h-5 w-5" />
    if (id === "p5") return <Paintbrush className="h-5 w-5" />
    if (id === "videogame") return <Code2 className="h-5 w-5" />
    return <Layout className="h-5 w-5" />
  }

  // Get available environments (filtered for Safari)
  const availableEnvironments = Object.values(ENVIRONMENTS).filter((env) => {
    if (isSafariOrIOS && (env.id === "web" || env.id === "flowscape")) {
      return false
    }
    return true
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Scape
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{STEPS[currentStep - 1].title}</DialogTitle>
          <DialogDescription>{STEPS[currentStep - 1].description}</DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                  currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-8 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[280px] overflow-y-auto px-1 py-1">
          {/* Step 1: Environment */}
          {currentStep === 1 && (
            <div className="grid grid-cols-2 gap-4 p-1">
              {availableEnvironments.map((env) => {
                const Icon = env.icon
                const isFlowScape = env.id === "flowscape"
                const isLocked = isFlowScape && !isAuthenticated

                return (
                  <Card
                    key={env.id}
                    title={isLocked ? "Sign in to access FlowScape" : undefined}
                    className={cn(
                      "relative flex flex-col gap-2 p-4 transition-all",
                      selectedEnv === env.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "hover:border-primary/50 hover:bg-muted/50",
                      isLocked ? "cursor-not-allowed opacity-70 grayscale" : "cursor-pointer"
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
                    <div className="w-fit rounded-lg bg-background p-3 shadow-sm">
                      <Icon className="h-6 w-6" />
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
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {env.description}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Step 2: Template */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2">
              {ENVIRONMENTS[selectedEnv].templates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer p-4 transition-all",
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-background p-3 shadow-sm">
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
          )}

          {/* Step 3: Storage */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2">
              <Card
                className={cn(
                  "cursor-pointer p-6 transition-all",
                  source === "local"
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "hover:border-primary/50 hover:bg-muted/50"
                )}
                onClick={() => setSource("local")}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-xl bg-background p-4 shadow-sm">
                    <Laptop className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">Local Device</div>
                    <div className="text-xs text-muted-foreground">
                      Saved to your browser. Works offline.
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                title={!isAuthenticated ? "Sign in to use Cloud Storage" : undefined}
                className={cn(
                  "relative p-6 transition-all",
                  source === "cloud"
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "hover:border-primary/50",
                  !isAuthenticated ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                )}
                onClick={() => {
                  if (isAuthenticated) setSource("cloud")
                }}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-xl bg-background p-4 shadow-sm">
                    <Cloud className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold">CodeScape Cloud</div>
                    <div className="text-xs text-muted-foreground">
                      Sync across all your devices.
                    </div>
                  </div>
                </div>
                {!isAuthenticated && (
                  <div className="absolute right-3 top-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Awesome Project"
                  value={name}
                  maxLength={25}
                  onChange={(e) => {
                    const val = e.target.value
                    setName(val)
                    if (val && !/^[a-zA-Z0-9 ]+$/.test(val)) {
                      setNameError("Only letters, numbers, and spaces allowed.")
                    } else if (val.length > 25) {
                      setNameError("Name must be 25 characters or less")
                    } else {
                      setNameError("")
                    }
                  }}
                  className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{name.length}/25</p>
                  {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">
                  Description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of your project..."
                  value={description}
                  maxLength={200}
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{description.length}/200</p>
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Summary
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Environment:</span>
                    <span className="font-medium">{ENVIRONMENTS[selectedEnv].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template:</span>
                    <span className="font-medium">
                      {ENVIRONMENTS[selectedEnv].templates.find((t) => t.id === selectedTemplate)
                        ?.name || "Blank"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="font-medium">
                      {source === "cloud" ? "Cloud" : "Local Device"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? () => setOpen(false) : prevStep}
            className="gap-1"
          >
            {currentStep === 1 ? (
              "Cancel"
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Back
              </>
            )}
          </Button>

          {currentStep < 4 ? (
            <Button onClick={nextStep} disabled={!canProceed()} className="gap-1">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !canProceed()}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Scape"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
