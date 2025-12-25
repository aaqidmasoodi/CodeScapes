/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import type { Project, Target } from "@/types/flow"
import { DEFAULT_PROJECT } from "@/types/flow"
import { db } from "@/lib/db"
import { debug } from "@/lib/debug"

interface FlowState {
  project: Project
  activeTargetId: string
  isHydrated: boolean

  // Actions
  hydrate: (scapeId: string, initialProject?: Project) => Promise<void>

  // VM Actions
  setActiveTarget: (id: string) => void
  addSprite: (asset?: { name: string; color?: string }) => void
  addBackdrop: (asset: { name: string; color: string }) => void
  deleteBackdrop: (costumeId: string) => void
  deleteTarget: (targetId: string) => void

  updateTargetBlocks: (targetId: string, blocks: any) => void
  updateTargetCode: (targetId: string, code: string) => void
  updateTarget: (targetId: string, data: Partial<Target>) => void

  // Engine Sync
  syncTargets: (updates: Partial<Target>[]) => void
}

export const useFlowStore = create<FlowState>((set, get) => ({
  project: DEFAULT_PROJECT,
  activeTargetId: "sprite-1",
  isHydrated: false,

  hydrate: async (scapeId: string, initialProject?: Project) => {
    // 1. Try Loading Autosave (Immediate Persistence)
    const autosave = await db.autosaves.get(scapeId)

    let projectToLoad = initialProject || DEFAULT_PROJECT

    if (autosave) {
      debug.log("[FlowStore] Hydrated from Autosave", new Date(autosave.timestamp))
      projectToLoad = autosave.data as unknown as Project
    } else if (initialProject) {
      debug.log("[FlowStore] Hydrated from File")
    }

    // Validate Project Structure (Defensive)
    if (!projectToLoad || !Array.isArray(projectToLoad.targets)) {
      console.error(
        "[FlowStore] Invalid project data found (missing targets). Reverting to default.",
        projectToLoad
      )
      projectToLoad = DEFAULT_PROJECT
    }

    // Ensure active target is valid
    let targetId = get().activeTargetId
    const targetExists = projectToLoad.targets.find((t) => t.id === targetId)
    if (!targetExists) {
      const firstSprite = projectToLoad.targets.find((t) => !t.isStage)
      const stage = projectToLoad.targets.find((t) => t.isStage)
      targetId = firstSprite?.id || stage?.id || "sprite-1"
    }

    set({
      project: projectToLoad,
      activeTargetId: targetId,
      isHydrated: true,
    })
  },

  setActiveTarget: (id) => set({ activeTargetId: id }),

  addSprite: (asset) =>
    set((state) => {
      const newId = uuidv4()
      const newSprite: Target = {
        id: newId,
        name: asset?.name || "Sprite " + state.project.targets.length,
        isStage: false,
        x: 0,
        y: 0,
        direction: 90,
        visible: true,
        size: 100,
        rotationStyle: "all around",
        variables: {},
        blocks: {},
        costumes: asset?.color
          ? [
              {
                id: uuidv4(),
                name: "Costume 1",
                assetId: asset.color, // Using color as assetId for V1
                dataFormat: "svg",
                md5ext: "color",
              },
            ]
          : [],
        currentCostume: 0,
      }

      return {
        project: {
          ...state.project,
          targets: [...state.project.targets, newSprite],
        },
        activeTargetId: newId,
      }
    }),

  addBackdrop: (asset) =>
    set((state) => {
      const stage = state.project.targets.find((t) => t.isStage)
      if (!stage) return state

      const newCostume = {
        id: uuidv4(),
        name: asset.name,
        assetId: asset.color,
        dataFormat: "svg" as const,
        md5ext: "color",
      }

      const updatedStage = {
        ...stage,
        costumes: [...(stage.costumes || []), newCostume],
        currentCostume: (stage.costumes || []).length,
      }

      return {
        project: {
          ...state.project,
          targets: state.project.targets.map((t) => (t.id === stage.id ? updatedStage : t)),
        },
      }
    }),

  deleteBackdrop: (costumeId) =>
    set((state) => {
      const stage = state.project.targets.find((t) => t.isStage)
      if (!stage || !stage.costumes || stage.costumes.length <= 1) return state

      const updatedCostumes = stage.costumes.filter((c) => c.id !== costumeId)
      let newIndex = stage.currentCostume
      if (newIndex >= updatedCostumes.length) newIndex = updatedCostumes.length - 1

      return {
        project: {
          ...state.project,
          targets: state.project.targets.map((t) =>
            t.id === stage.id
              ? {
                  ...stage,
                  costumes: updatedCostumes,
                  currentCostume: newIndex,
                }
              : t
          ),
        },
      }
    }),

  deleteTarget: (targetId) =>
    set((state) => {
      // Prevent deleting last sprite? Or stage?
      const target = state.project.targets.find((t) => t.id === targetId)
      if (!target || target.isStage) return state

      const newTargets = state.project.targets.filter((t) => t.id !== targetId)

      // If we deleted the active target, switch to another
      let newActiveId = state.activeTargetId
      if (state.activeTargetId === targetId) {
        const firstSprite = newTargets.find((t) => !t.isStage)
        const stage = newTargets.find((t) => t.isStage)
        newActiveId = firstSprite?.id || stage?.id || ""
      }

      return {
        project: {
          ...state.project,
          targets: newTargets,
        },
        activeTargetId: newActiveId,
      }
    }),

  updateTargetBlocks: (targetId, blocks) =>
    set((state) => ({
      project: {
        ...state.project,
        targets: state.project.targets.map((t) => (t.id === targetId ? { ...t, blocks } : t)),
      },
    })),

  updateTargetCode: (targetId, code) =>
    set((state) => ({
      project: {
        ...state.project,
        targets: state.project.targets.map((t) => (t.id === targetId ? { ...t, code } : t)),
      },
    })),

  updateTarget: (targetId, data) =>
    set((state) => ({
      project: {
        ...state.project,
        targets: state.project.targets.map((t) => (t.id === targetId ? { ...t, ...data } : t)),
      },
    })),

  syncTargets: (updates) =>
    set((state) => ({
      project: {
        ...state.project,
        targets: state.project.targets.map((t) => {
          const update = updates.find((u) => u.id === t.id)
          return update ? { ...t, ...update } : t
        }),
      },
    })),
}))

// --- PERSISTENCE SUBSCRIPTION ---
export const initAutosave = (scapeId: string) => {
  return useFlowStore.subscribe((state) => {
    if (!state.isHydrated) return // Don't save empty state over real data

    db.autosaves
      .put({
        id: scapeId,
        data: state.project as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      })
      .catch((err) => console.error("Autosave Failed", err))
  })
}
