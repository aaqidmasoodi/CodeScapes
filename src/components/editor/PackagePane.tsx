import { Package, Trash2, Box, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface PackagePaneProps {
  dependencies: string[]
  onDeletePackage: (pkg: string) => void
  onInstallPackage?: (pkg: string) => void
  language?: string
}

export function PackagePane({
  dependencies,
  onDeletePackage,
  onInstallPackage,
  language,
}: PackagePaneProps) {
  const [newPackage, setNewPackage] = useState("")
  const [isInstalling, setIsInstalling] = useState(false)

  const handleInstall = async () => {
    if (!newPackage.trim() || !onInstallPackage) return
    setIsInstalling(true)
    try {
      await onInstallPackage(newPackage)
      setNewPackage("")
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold text-muted-foreground">
        <Box className="h-4 w-4" />
        <span>INSTALLED PACKAGES</span>
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
          {dependencies.length}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {language === "r" && (
          <div className="mb-4 border-b px-2 pb-4 pt-2">
            <div className="flex gap-2">
              <Input
                value={newPackage}
                onChange={(e) => setNewPackage(e.target.value)}
                placeholder="Package name..."
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleInstall()}
              />
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={isInstalling || !newPackage}
                className="h-8 px-3 text-xs"
              >
                {isInstalling ? <Loader2 className="h-3 w-3 animate-spin" /> : "Install"}
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Installs binary from r-wasm (CRAN mirror).
            </p>
          </div>
        )}

        {dependencies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 pt-10 text-center text-xs text-muted-foreground">
            <Package className="h-8 w-8 opacity-20" />
            <p>No packages install yet.</p>
            {language !== "r" && (
              <p className="mt-2 px-4 opacity-75">
                Use <code className="rounded bg-muted px-1 py-0.5">pip install &lt;name&gt;</code>{" "}
                in the terminal to add packages.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {dependencies.map((pkg) => (
              <div
                key={pkg}
                className="group flex items-center justify-between rounded p-2 text-sm hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium">{pkg}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  onClick={() => onDeletePackage(pkg)}
                  title={`Uninstall ${pkg}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
