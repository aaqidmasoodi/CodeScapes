/// <reference types="vite/client" />

declare module "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs" {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  export interface PyodideInterface {
    runPythonAsync: (code: string) => Promise<any>
    loadPackage: (packages: string[]) => Promise<void>
    FS: {
      writeFile: (path: string, content: string | Uint8Array, options?: any) => void
      mkdir: (path: string) => void
      readdir: (path: string) => string[]
    }
    setStdout: (options: { batched: (msg: string) => void }) => void
    setStderr: (options: { batched: (msg: string) => void }) => void
    globals: any
  }

  export function loadPyodide(config: { indexURL: string }): Promise<PyodideInterface>
}
