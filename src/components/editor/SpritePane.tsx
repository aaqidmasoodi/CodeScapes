import { useState } from "react"
import type { Target } from "@/types/flow"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Eye, EyeOff, Image as ImageIcon, Cat } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// --- ASSET DATA ---
const SPRITE_ASSETS = [
    { name: "Cat", color: "orange" },
    { name: "Apple", color: "red" },
    { name: "Paddle", color: "green" },
    { name: "Ball", color: "yellow" },
]

const BACKDROP_ASSETS = [
    { name: "White", color: "#ffffff" },
    { name: "Blue Sky", color: "#87CEEB" },
    { name: "Night", color: "#000033" },
    { name: "Forest", color: "#228B22" },
    { name: "Sunset", color: "#FF4500" },
]

interface SpritePaneProps {
    targets: Target[]
    activeTargetId: string
    onSelect: (id: string) => void
    onAdd: (asset?: { name: string; color?: string }) => void
    onAddBackdrop?: (asset: { name: string; color: string }) => void
    onUpdate: (id: string, data: Partial<Target>) => void
    onDelete?: (id: string) => void
    onDeleteBackdrop?: (id: string) => void
}

export function SpritePane({
    targets,
    activeTargetId,
    onSelect,
    onAdd,
    onAddBackdrop,
    onUpdate,
    onDelete,
    onDeleteBackdrop
}: SpritePaneProps) {
    const sprites = targets.filter((t) => !t.isStage)
    const stage = targets.find((t) => t.isStage)
    const activeTarget = targets.find(t => t.id === activeTargetId)

    const [pickerOpen, setPickerOpen] = useState(false)
    const [pickerType, setPickerType] = useState<"sprite" | "backdrop">("sprite")

    const handleOpenPicker = (type: "sprite" | "backdrop") => {
        setPickerType(type)
        setPickerOpen(true)
    }

    const handleAssetSelect = (asset: any) => {
        if (pickerType === "sprite") {
            onAdd(asset)
        } else {
            onAddBackdrop?.(asset)
        }
        setPickerOpen(false)
    }

    return (
        <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-muted/10">
            {/* PROPERTIES PANEL (Only for Active Sprite) */}
            {activeTarget && !activeTarget.isStage && (
                <div className="flex flex-col gap-2 border-b border-border bg-background p-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-1 flex-col gap-1">
                            <Label className="text-[10px] text-muted-foreground">Sprite</Label>
                            <Input
                                className="h-7 text-xs"
                                value={activeTarget.name}
                                onChange={(e) => onUpdate(activeTarget.id, { name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-16">
                            <Label className="text-[10px] text-muted-foreground">Size</Label>
                            <Input
                                className="h-7 text-xs"
                                type="number"
                                value={activeTarget.size ?? 100}
                                onChange={(e) => onUpdate(activeTarget.id, { size: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex w-16 flex-col gap-1">
                            <Label className="text-[10px] text-muted-foreground">X</Label>
                            <Input
                                className="h-7 text-xs"
                                type="number"
                                value={activeTarget.x ?? 0}
                                onChange={(e) => onUpdate(activeTarget.id, { x: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex w-16 flex-col gap-1">
                            <Label className="text-[10px] text-muted-foreground">Y</Label>
                            <Input
                                className="h-7 text-xs"
                                type="number"
                                value={activeTarget.y ?? 0}
                                onChange={(e) => onUpdate(activeTarget.id, { y: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex w-16 flex-col gap-1">
                            <Label className="text-[10px] text-muted-foreground">Dir</Label>
                            <Input
                                className="h-7 text-xs"
                                type="number"
                                value={activeTarget.direction ?? 90}
                                onChange={(e) => onUpdate(activeTarget.id, { direction: Number(e.target.value) })}
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-1 items-end justify-end pb-1">
                            <div className="flex items-center rounded-md border border-input bg-transparent shadow-sm">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={cn("h-6 w-8 rounded-none rounded-l-md px-1", activeTarget.visible ? "bg-accent" : "")}
                                    onClick={() => onUpdate(activeTarget.id, { visible: true })}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <div className="h-4 w-[1px] bg-border" />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={cn("h-6 w-8 rounded-none rounded-r-md px-1", !activeTarget.visible ? "bg-accent" : "")}
                                    onClick={() => onUpdate(activeTarget.id, { visible: false })}
                                >
                                    <EyeOff className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE PROPERTIES PANEL */}
            {activeTarget && activeTarget.isStage && (
                <div className="flex flex-col gap-2 border-b border-border bg-background p-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-1 flex-col gap-1">
                            <Label className="text-[10px] text-muted-foreground">Stage Name</Label>
                            <Input
                                className="h-7 text-xs"
                                value={activeTarget.name}
                                onChange={(e) => onUpdate(activeTarget.id, { name: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* Active Backdrop Info */}
                    {stage?.costumes && stage.costumes[stage.currentCostume] && (
                        <div className="flex items-center gap-2 mt-1">
                            <div
                                className="h-6 w-8 rounded border border-border"
                                style={{ backgroundColor: stage.costumes[stage.currentCostume].assetId || 'white' }}
                            />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground">Backdrop</span>
                                <span className="text-xs font-medium">{stage.costumes[stage.currentCostume].name}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SPLIT LAYOUT */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT: SPRITE LIST */}
                <div className="flex flex-1 flex-col border-r border-border relative">
                    <div className="flex items-center justify-between border-b border-border bg-muted/20 p-2">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Sprites</span>
                        <span className="text-[10px] text-muted-foreground">{sprites.length}</span>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 pb-12">
                            {sprites.map((sprite) => (
                                <div
                                    key={sprite.id}
                                    onClick={() => onSelect(sprite.id)}
                                    className={cn(
                                        "group relative flex cursor-pointer flex-col items-center rounded-md border p-2 text-xs transition-colors hover:bg-muted/50",
                                        activeTargetId === sprite.id
                                            ? "border-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                                            : "border-border bg-background"
                                    )}
                                >
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        {/* Placeholder Icon */}
                                        <div className="h-6 w-6 rounded-sm opacity-80" style={{ backgroundColor: sprite.name.toLowerCase().includes('ball') ? 'yellow' : 'orange' }} />
                                    </div>
                                    <span className="max-w-full truncate font-medium">{sprite.name}</span>
                                    {onDelete && (
                                        <button
                                            className="absolute right-1 top-1 hidden rounded-sm bg-background/80 p-1 text-muted-foreground hover:bg-red-500 hover:text-white group-hover:block"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(sprite.id)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Floating Add Sprite Button */}
                    <Button
                        size="icon"
                        className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg z-50"
                        onClick={() => handleOpenPicker("sprite")}
                        title="Add Sprite"
                    >
                        <Cat className="h-5 w-5" />
                    </Button>
                </div>

                {/* RIGHT: STAGE PANE (Fixed Width - Now a List) */}
                <div className="flex w-32 flex-col bg-background relative border-l border-border">
                    <div className="flex items-center justify-between border-b border-border bg-muted/20 p-2">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Backdrops</span>
                        <span className="text-[10px] text-muted-foreground">{stage?.costumes?.length || 0}</span>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-2 p-2 pb-12">
                            {stage?.costumes?.map((costume, index) => (
                                <div
                                    key={costume.id}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-1 p-1 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors",
                                        (activeTargetId === stage.id && stage.currentCostume === index) ? "border-blue-500 bg-blue-500/10" : "border-border"
                                    )}
                                    onClick={() => {
                                        onSelect(stage.id)
                                        onUpdate(stage.id, { currentCostume: index })
                                    }}
                                >
                                    <div className="aspect-[4/3] w-full rounded border border-border bg-white overflow-hidden shadow-sm relative">
                                        <div
                                            className="absolute inset-0"
                                            style={{ backgroundColor: costume.assetId || 'white' }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">{costume.name}</span>

                                    {/* Delete Backdrop Button */}
                                    {onDeleteBackdrop && stage.costumes && stage.costumes.length > 1 && (
                                        <button
                                            className="absolute right-1 top-1 hidden rounded-sm bg-background/80 p-1 text-muted-foreground hover:bg-red-500 hover:text-white group-hover:block"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDeleteBackdrop(costume.id)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Floating Add Backdrop Button */}
                    <Button
                        size="icon"
                        className="absolute bottom-4 right-4 h-8 w-8 rounded-full shadow-lg z-50"
                        onClick={() => handleOpenPicker("backdrop")}
                        title="Add Backdrop"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>

            </div>

            {/* ASSET PICKER MODAL */}
            <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Choose a {pickerType === "sprite" ? "Sprite" : "Backdrop"}</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue={pickerType} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="sprite" onClick={() => setPickerType("sprite")}>Sprites</TabsTrigger>
                            <TabsTrigger value="backdrop" onClick={() => setPickerType("backdrop")}>Backdrops</TabsTrigger>
                        </TabsList>

                        <TabsContent value="sprite" className="h-64">
                            <ScrollArea className="h-full">
                                <div className="grid grid-cols-4 gap-4 p-2">
                                    {SPRITE_ASSETS.map((asset, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col items-center gap-2 rounded-md border p-4 hover:bg-muted cursor-pointer"
                                            onClick={() => handleAssetSelect(asset)}
                                        >
                                            <div className="h-12 w-12 rounded-full" style={{ backgroundColor: asset.color }} />
                                            <span className="text-sm font-medium">{asset.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="backdrop" className="h-64">
                            <ScrollArea className="h-full">
                                <div className="grid grid-cols-3 gap-4 p-2">
                                    {BACKDROP_ASSETS.map((asset, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col gap-2 rounded-md border p-2 hover:bg-muted cursor-pointer"
                                            onClick={() => handleAssetSelect(asset)}
                                        >
                                            <div className="aspect-video w-full rounded border" style={{ backgroundColor: asset.color }} />
                                            <span className="text-sm font-medium text-center">{asset.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>

                </DialogContent>
            </Dialog>
        </div>
    )
}
