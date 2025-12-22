import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react"
import { Lock, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { secretsService } from "@/services/secrets"
import type { Secret } from "@/types/secret"

export interface SecretsPanelHandle {
  handlePasteEnv: (content: string) => void
}

interface SecretsPanelProps {
  scapeId: string
  isOpen: boolean
}

export const SecretsPanel = forwardRef<SecretsPanelHandle, SecretsPanelProps>(
  ({ scapeId, isOpen }, ref) => {
    const [secrets, setSecrets] = useState<Secret[]>([])
    const [loading, setLoading] = useState(false)
    const [newKey, setNewKey] = useState("")
    const [newValue, setNewValue] = useState("")
    const [revealed, setRevealed] = useState<Set<string>>(new Set())
    const { toast } = useToast()

    const loadSecrets = useCallback(async () => {
      try {
        setLoading(true)
        const data = await secretsService.getSecrets(scapeId)
        setSecrets(data)
      } catch (error) {
        console.error(error)
        toast({ variant: "destructive", title: "Failed to load secrets" })
      } finally {
        setLoading(false)
      }
    }, [scapeId, toast])

    useEffect(() => {
      if (isOpen && scapeId) {
        loadSecrets()
      }
    }, [isOpen, scapeId, loadSecrets])

    const handleAdd = async () => {
      if (!newKey.trim() || !newValue.trim()) return

      // Validate Env Key Format (Uppercase, Alphanumeric, Underscore)
      if (!/^[A-Z_][A-Z0-9_]*$/.test(newKey)) {
        toast({
          variant: "destructive",
          title: "Invalid Key Format",
          description:
            "Detailed keys must use UPPERCASE letters, numbers, and underscores (e.g. MY_API_KEY)",
        })
        return
      }

      try {
        const saved = await secretsService.upsertSecret(scapeId, newKey, newValue)
        setSecrets((prev) => {
          // Replace if exists, else add
          const filtered = prev.filter((s) => s.key !== saved.key)
          return [...filtered, saved].sort((a, b) => a.key.localeCompare(b.key))
        })
        setNewKey("")
        setNewValue("")
        toast({ title: "Secret saved" })
      } catch (error) {
        console.error(error)
        toast({ variant: "destructive", title: "Failed to save secret" })
      }
    }

    const handleDelete = async (id: string, key: string) => {
      try {
        await secretsService.deleteSecret(id)
        setSecrets((prev) => prev.filter((s) => s.id !== id))
        toast({ title: `Deleted ${key}` })
      } catch (error) {
        console.error(error)
        toast({ variant: "destructive", title: "Failed to delete" })
      }
    }

    const toggleReveal = (id: string) => {
      setRevealed((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }

    // Virtual Env Paste Handler
    const handlePasteEnv = (text: string) => {
      // Basic parser
      const lines = text.split("\n")
      let addedCount = 0

      lines.forEach((line) => {
        const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=(.*)$/)
        if (match) {
          const k = match[1].trim()
          const v = match[2].trim().replace(/^["']|["']$/g, "") // strip quotes
          secretsService.upsertSecret(scapeId, k, v).then(() => {
            // Refresh list eventually?
          })
          addedCount++
        }
      })
      if (addedCount > 0) {
        setTimeout(loadSecrets, 1000)
        toast({ title: `Imported ${addedCount} secrets from paste` })
      }
    }

    useImperativeHandle(ref, () => ({
      handlePasteEnv,
    }))

    if (!isOpen) return null

    return (
      <div className="flex h-full flex-col border-r border-muted/50 bg-muted/5 transition-colors">
        <div className="flex items-center justify-between border-b border-muted/50 bg-background/50 px-3 py-2 backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Secrets Vault
          </span>
          <div className="flex items-center gap-1">{/* Future: Import/Export buttons? */}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {/* Add Form */}
          <div className="mb-4 space-y-2 rounded-md border border-muted/40 bg-background/50 p-3 shadow-sm">
            {/* <div className="text-xs font-semibold text-muted-foreground">Add New Secret</div> */}
            <Input
              placeholder="KEY (e.g. API_KEY)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              className="h-7 font-mono text-xs"
            />
            <div className="flex gap-2">
              <Input
                placeholder="VALUE"
                type="password"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="h-7 flex-1 text-xs"
              />
              <Button
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleAdd}
                disabled={!newKey || !newValue}
                title="Add Secret"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="px-2 pb-2 text-[10px] text-muted-foreground">
            Access via <code className="rounded bg-muted px-1">process.env.KEY</code> for web
            environment and <code className="rounded bg-muted px-1">os.environ["KEY"]</code> for
            python environment.
          </div>

          {/* List */}
          <div className="flex flex-col gap-1">
            {secrets.map((secret) => (
              <div
                key={secret.id}
                className="group flex flex-col justify-between gap-2 rounded-sm border border-transparent px-2 py-1.5 text-sm transition-colors hover:border-muted/20 hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-blue-500/80" />
                    <span
                      className="truncate font-mono text-xs font-medium text-foreground/90"
                      title={secret.key}
                    >
                      {secret.key}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                    onClick={() => handleDelete(secret.id, secret.key)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="relative pl-5">
                  <Input
                    readOnly
                    value={secret.value}
                    type={revealed.has(secret.id) ? "text" : "password"}
                    className="h-6 border-transparent bg-muted/30 pr-7 font-mono text-[10px] text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-6 w-6 text-muted-foreground hover:bg-transparent"
                    onClick={() => toggleReveal(secret.id)}
                  >
                    {revealed.has(secret.id) ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {secrets.length === 0 && !loading && (
              <div className="py-8 text-center text-xs text-muted-foreground">No secrets yet.</div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

SecretsPanel.displayName = "SecretsPanel"
