import type { ScapeFile } from "@/types/file"

export interface FileNode {
  id: string
  name: string
  path: string
  type: "file" | "folder"
  file?: ScapeFile
  children?: FileNode[]
  isOpen?: boolean
}

/**
 * Robustly converts a list of flat file paths/objects into a nested tree structure.
 * Handles "folder" type files (language='folder') vs regular files.
 * Sorts folders first, then files, alphabetically.
 */
export function buildFileTree(files: ScapeFile[]): FileNode[] {
  const root: FileNode[] = []

  // 1. Identify explicitly defined folders first
  files.forEach((file) => {
    // Explicit type cast check or assume string check if type definition is loose
    if ((file.language as string) === "folder") {
      const parts = file.name.split("/")
      ensurePath(parts, root, true, file)
    }
  })

  // 2. Process all files
  files.forEach((file) => {
    if ((file.language as string) !== "folder") {
      const parts = file.name.split("/")
      ensurePath(parts, root, false, file)
    }
  })

  // 3. Recursive sort
  return sortTree(root)
}

function ensurePath(
  parts: string[],
  currentLevel: FileNode[],
  isExplicitFolder: boolean,
  originalFile: ScapeFile
) {
  let currentPath = ""

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    // Construct path for this segment
    currentPath = currentPath ? `${currentPath}/${part}` : part

    const isLastPart = i === parts.length - 1
    const isFile = isLastPart && !isExplicitFolder // Only the last part is a file, OR it's a folder we are defining

    // Check if this node already exists at this level
    let node = currentLevel.find((n) => n.name === part)

    if (!node) {
      node = {
        id: currentPath, // Use path as unique ID
        name: part,
        path: currentPath,
        type: isFile ? "file" : "folder",
        children: isFile ? undefined : [],
        // If it's the actual file entry we are processing(last part), attach the data
        file: isLastPart ? originalFile : undefined,
      }
      currentLevel.push(node)
    } else {
      // If the node exists, but we are now processing the "Explicit Folder" entry for it, update it
      if (isLastPart && isExplicitFolder) {
        node.type = "folder"
        node.file = originalFile
        if (!node.children) node.children = []
      }
      // If the node exists as a folder, but we are processing a file that matches (collision?), ignore or handle?
      // For now, existing folder structure takes precedence.

      // Ensure children array exists if it's treated as a folder
      if (!isFile && !node.children) {
        node.children = []
      }
    }

    // If it's a folder (or intermediate step), we descend into its children
    if (!isFile) {
      if (node.children) {
        currentLevel = node.children
      }
    }
  }
}

function sortTree(nodes: FileNode[]): FileNode[] {
  return nodes
    .sort((a, b) => {
      // Folders first
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1
      }
      // Then alphabetical
      return a.name.localeCompare(b.name)
    })
    .map((node) => {
      if (node.children) {
        node.children = sortTree(node.children)
      }
      return node
    })
}
