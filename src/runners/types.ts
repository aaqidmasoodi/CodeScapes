export interface ScapeRunnerHandle {
  captureThumbnail(): Promise<string | null>
  restart(): Promise<void>
  installPackage(pkg: string): Promise<{ success: boolean; error?: string }>
}
