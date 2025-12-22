export interface Costume {
  id: string
  name: string
  assetId: string // Reference to a file in the project
  dataFormat: "png" | "svg" | "jpg"
  md5ext?: string
  bitmapResolution?: number
  rotationCenterX?: number
  rotationCenterY?: number
}

export interface Target {
  id: string
  name: string
  isStage: boolean

  // State
  x: number
  y: number
  direction: number
  visible: boolean
  size: number
  rotationStyle: "all around" | "left-right" | "don't rotate"

  // Storage
  variables: Record<string, any>
  blocks: Record<string, any> // Serialized Blockly JSON/XML
  code?: string // Compiled Generator Function Body

  // Assets
  costumes: Costume[]
  currentCostume: number
}

export interface Project {
  targets: Target[]
  meta: {
    semver: string
    vm: string
    agent: string
  }
}

// Default "Empty" Project with one Cat
export const DEFAULT_PROJECT: Project = {
  meta: {
    semver: "3.0.0",
    vm: "0.1.0",
    agent: "FlowScape",
  },
  targets: [
    {
      id: "stage",
      name: "Stage",
      isStage: true,
      x: 0,
      y: 0,
      direction: 90,
      visible: true,
      size: 100,
      rotationStyle: "all around",
      variables: {},
      blocks: {},
      costumes: [
        { id: "backdrop-1", name: "White", assetId: "#ffffff", dataFormat: "svg" },
        { id: "backdrop-2", name: "Red", assetId: "#ff0000", dataFormat: "svg" },
        { id: "backdrop-3", name: "Green", assetId: "#00ff00", dataFormat: "svg" },
      ],
      currentCostume: 0,
    },
    {
      id: "sprite-1",
      name: "Cat",
      isStage: false,
      x: 0,
      y: 0,
      direction: 90,
      visible: true,
      size: 100,
      rotationStyle: "all around",
      variables: {},
      blocks: {},
      costumes: [], // We'll need to load default assets later
      currentCostume: 0,
    },
  ],
}
