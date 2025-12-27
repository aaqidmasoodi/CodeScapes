import type { ComponentType } from "react"
import type { ScapeRunnerProps } from "./types"
import { PythonRunner } from "./python/PythonRunner"
import { WebRunner } from "./web/WebRunner"
import { RRunner } from "./r/RRunner"

// We use 'any' for the component type here slightly loosely because
// different runners might have slightly different extended props,
// but they all satisfy the core Contract.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RUNNER_REGISTRY: Record<string, ComponentType<ScapeRunnerProps & any>> = {
  web: WebRunner,
  "web-runner": WebRunner,
  python: PythonRunner,
  "python-runner": PythonRunner,
  "data-science": PythonRunner,
  r: RRunner,
  "r-runner": RRunner,
  node: WebRunner, // Fallback for now
}

export function getRunner(env: string = "web") {
  return RUNNER_REGISTRY[env] || WebRunner
}
