import { SHORTCUTS, getShortcutLabel, isMac } from "@/config/shortcuts"
import { Monitor, Keyboard, Laptop, Code2 } from "lucide-react"

export function SettingsPane() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background p-6">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Editor Settings</h2>
        <p className="text-muted-foreground">
          Customize your coding environment and view shortcuts.
        </p>
      </div>

      <div className="space-y-8">
        {/* Environment Info */}
        <section>
          <div className="mb-4 flex items-center gap-2 border-b pb-2">
            <Monitor className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Environment</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <Laptop className="h-4 w-4" />
                <span>Platform</span>
              </div>
              <p>{isMac ? "macOS" : "Windows / Linux"}</p>
            </div>
            <div className="rounded-md border p-4">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <Code2 className="h-4 w-4" />
                <span>Engine</span>
              </div>
              <p>Monaco Editor</p>
            </div>
          </div>
        </section>

        {/* Shortcuts Cheat Sheet */}
        <section>
          <div className="mb-4 flex items-center gap-2 border-b pb-2">
            <Keyboard className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="grid grid-cols-2 border-b bg-muted/40 p-3 text-sm font-medium">
              <div>Action</div>
              <div className="text-right">Keybinding</div>
            </div>
            <div className="divide-y">
              {SHORTCUTS.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="grid grid-cols-2 items-center p-3 text-sm transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{shortcut.label}</span>
                    <span className="text-xs text-muted-foreground">{shortcut.description}</span>
                  </div>
                  <div className="flex justify-end">
                    <kbd className="inline-flex h-6 min-w-[20px] items-center justify-center rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
                      {getShortcutLabel(shortcut)}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
