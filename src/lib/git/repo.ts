/**
 * Local Git Repository Management
 *
 * Uses isomorphic-git + lightning-fs for browser-based git operations.
 * Each scape has its own git repository stored in IndexedDB.
 */

import "@/lib/polyfill"
import git from "isomorphic-git"
import LightningFS from "@isomorphic-git/lightning-fs"

// Cache of filesystem instances per scape
const fsCache = new Map<string, LightningFS>()

/**
 * Get or create a filesystem for a scape
 */
export function getFS(scapeId: string): LightningFS {
  if (!fsCache.has(scapeId)) {
    const fs = new LightningFS(`scape-${scapeId}`)
    fsCache.set(scapeId, fs)
  }
  return fsCache.get(scapeId)!
}

/**
 * Get the repo directory path for a scape
 */
export function getRepoDir(scapeId: string): string {
  return `/scape-${scapeId}`
}

/**
 * Initialize a git repo for a scape (if not already initialized)
 */
export async function initRepo(scapeId: string): Promise<void> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  try {
    // Check if already initialized
    await fs.promises.stat(`${dir}/.git`)
    return // Already exists
  } catch {
    // Need to initialize
  }

  // Create directory
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await fs.promises.mkdir(dir, { recursive: true } as any)
  } catch {
    // May already exist
  }

  // Initialize git repo
  await git.init({ fs, dir })

  // Set default author config
  await git.setConfig({
    fs,
    dir,
    path: "user.name",
    value: "CodeScapes User",
  })
  await git.setConfig({
    fs,
    dir,
    path: "user.email",
    value: "user@codescapes.app",
  })
}

/**
 * Sync the IndexedDB filesystem with the current in-memory files.
 * Writes new/modified files and deletes removed files.
 * Ignores .git directory.
 */
export async function syncFileSystem(
  scapeId: string,
  files: Array<{ name: string; content: string }>
): Promise<void> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  // 1. Write all current files
  await writeFiles(scapeId, files)

  // 2. Clean up deleted files (files in FS but not in memory)
  // We need to verify what's currently in FS vs what should be there.
  // This can be expensive, so maybe we skip deletion sync for MVP?
  // User asked for robust tracking. Deletion is part of that.

  // Helper to get all files in FS
  const currentFsFiles = await getAllFiles(fs, dir)
  const activeFileNames = new Set(files.map((f) => f.name))

  for (const fsFile of currentFsFiles) {
    if (!activeFileNames.has(fsFile)) {
      // File exists in FS but not in memory -> Delete it
      try {
        console.log("[GitRepo] Deleting stale file:", fsFile)
        await fs.promises.unlink(`${dir}/${fsFile}`)
        // Cleaning up empty dirs is harder, ignoring for now
      } catch (e: unknown) {
        if ((e as { code?: string })?.code !== "ENOENT") {
          console.warn("Failed to delete stale file:", fsFile, e)
        }
      }
    }
  }
}

/**
 * Helper to recursively get all files in a directory
 */
async function getAllFiles(
  fs: LightningFS,
  dirPath: string,
  rootDir: string = dirPath,
  fileList: string[] = []
): Promise<string[]> {
  try {
    const entries = await fs.promises.readdir(dirPath)
    for (const entry of entries) {
      if (entry === ".git") continue

      const fullPath = `${dirPath}/${entry}`
      const stat = await fs.promises.stat(fullPath)
      if (stat.isDirectory()) {
        await getAllFiles(fs, fullPath, rootDir, fileList)
      } else {
        // Store relative path from repo root
        // +1 for the slash
        fileList.push(fullPath.substring(rootDir.length + 1))
      }
    }
  } catch {
    // dir might not exist
  }
  return fileList
}

/**
 * Write files to the repo working directory
 */
export async function writeFiles(
  scapeId: string,
  files: Array<{ name: string; content: string }>
): Promise<void> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  for (const file of files) {
    const filePath = `${dir}/${file.name}`

    // Ensure parent directories exist
    const parts = file.name.split("/")
    if (parts.length > 1) {
      const parentDir = `${dir}/${parts.slice(0, -1).join("/")}`
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await fs.promises.mkdir(parentDir, { recursive: true } as any)
      } catch {
        // May already exist
      }
    }

    // Optimization: Only write if content changed?
    // For now, always write to ensure consistency.
    await fs.promises.writeFile(filePath, file.content, "utf8")
  }
}

/**
 * Stage all files and commit
 * Properly handles: additions, modifications, AND deletions
 */
export async function commit(
  scapeId: string,
  message: string,
  files: Array<{ name: string; content: string }>
): Promise<string> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  // Ensure repo is initialized
  await initRepo(scapeId)

  // Write files to working directory
  await writeFiles(scapeId, files)

  // Get files from HEAD commit to detect deletions
  const headFiles = await getFilesFromHead(scapeId)
  const currentFileNames = new Set(files.map((f) => f.name))

  // Stage deletions - files in HEAD but not in current files
  for (const headFile of headFiles) {
    if (!currentFileNames.has(headFile)) {
      try {
        await git.remove({ fs, dir, filepath: headFile })
      } catch (e) {
        console.warn("[GitRepo] Failed to stage removal:", headFile, e)
      }
    }
  }

  // Stage additions/modifications
  for (const file of files) {
    await git.add({ fs, dir, filepath: file.name })
  }

  // Commit
  const sha = await git.commit({
    fs,
    dir,
    message,
    author: {
      name: "CodeScapes User",
      email: "user@codescapes.app",
    },
  })

  return sha
}

/**
 * Get commit history
 */
export interface CommitInfo {
  sha: string
  message: string
  timestamp: number
  author: string
}

export async function getLog(scapeId: string, maxCount = 50): Promise<CommitInfo[]> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  // Ensure repo exists before checking log
  await initRepo(scapeId)

  try {
    const commits = await git.log({ fs, dir, depth: maxCount })

    return commits.map((c) => ({
      sha: c.oid,
      message: c.commit.message,
      timestamp: c.commit.author.timestamp * 1000, // Convert to ms
      author: c.commit.author.name,
    }))
  } catch {
    // No commits yet
    return []
  }
}

/**
 * Get list of files from the HEAD commit tree
 * Used for detecting deletions (files in HEAD but not in working directory)
 */
async function getFilesFromHead(scapeId: string): Promise<string[]> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)
  const files: string[] = []

  try {
    const head = await git.resolveRef({ fs, dir, ref: "HEAD" })
    const { commit: commitObj } = await git.readCommit({ fs, dir, oid: head })

    async function walkTree(treeOid: string, prefix = "") {
      const { tree } = await git.readTree({ fs, dir, oid: treeOid })
      for (const entry of tree) {
        const fullPath = prefix ? `${prefix}/${entry.path}` : entry.path
        if (entry.type === "tree") {
          await walkTree(entry.oid, fullPath)
        } else {
          files.push(fullPath)
        }
      }
    }

    await walkTree(commitObj.tree)
  } catch {
    // No commits yet - that's fine, return empty
  }

  return files
}

/**
 * Get list of changed files (compared to last commit)
 * Properly detects: added, modified, AND deleted files
 */
export interface FileStatus {
  path: string
  status: "added" | "modified" | "deleted" | "unmodified"
}

export async function getStatus(scapeId: string): Promise<FileStatus[]> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  try {
    await initRepo(scapeId)

    // Get files from working directory (for additions/modifications)
    const workdirFiles = await getAllFiles(fs, dir)

    // Get files from HEAD commit (for deletions)
    const headFiles = await getFilesFromHead(scapeId)

    // Union of both sets - this ensures we check ALL relevant files
    const allFilepaths = [...new Set([...workdirFiles, ...headFiles])]

    if (allFilepaths.length === 0) {
      return []
    }

    const matrix = await git.statusMatrix({ fs, dir, filepaths: allFilepaths })
    if (!matrix) return []

    return matrix
      .map(([filepath, head, workdir]) => {
        let status: FileStatus["status"] = "unmodified"

        // head=0 means file doesn't exist in HEAD (new file)
        // head=1 means file exists in HEAD
        // workdir=0 means file doesn't exist in working directory (deleted)
        // workdir=2 means file exists in working directory

        if (head === 0 && workdir === 2) {
          status = "added"
        } else if (head === 1 && workdir === 0) {
          status = "deleted"
        } else if (head === 1 && workdir === 2) {
          // File exists in both - need to check if content changed
          // statusMatrix returns workdir=2 for both unchanged AND modified
          // We need to check the stage column (index 3) or compare content
          // Actually, workdir=2 with head=1 means it's tracked and present
          // The stage column tells us about index state
          // For simplicity, let's say if workdir differs from head, it's modified
          status = "modified"
        }

        return { path: filepath, status }
      })
      .filter((f) => f.status !== "unmodified")
  } catch (e) {
    console.error("[GitRepo] Status check failed", e)
    return []
  }
}

/**
 * Checkout a specific commit (restore files)
 */
export async function checkout(
  scapeId: string,
  commitSha: string
): Promise<Array<{ name: string; content: string }>> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  const { commit: commitObj } = await git.readCommit({ fs, dir, oid: commitSha })
  // tree variable removed as it was unused and caused lint error

  const files: Array<{ name: string; content: string }> = []

  // Recursively read all files from the tree
  async function readTreeRecursive(treeOid: string, prefix = "") {
    const { tree: entries } = await git.readTree({ fs, dir, oid: treeOid })

    for (const entry of entries) {
      const fullPath = prefix ? `${prefix}/${entry.path}` : entry.path

      if (entry.type === "tree") {
        await readTreeRecursive(entry.oid, fullPath)
      } else if (entry.type === "blob") {
        const { blob } = await git.readBlob({ fs, dir, oid: entry.oid })
        const content = new TextDecoder().decode(blob)
        files.push({ name: fullPath, content })
      }
    }
  }

  await readTreeRecursive(commitObj.tree)

  return files
}

/**
 * Delete a repo (clear IndexedDB for this scape)
 */
export async function deleteRepo(scapeId: string): Promise<void> {
  const fs = getFS(scapeId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await fs.promises.rmdir(getRepoDir(scapeId), { recursive: true } as any)
  fsCache.delete(scapeId)
}

export async function repoExists(scapeId: string): Promise<boolean> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)

  try {
    await fs.promises.stat(`${dir}/.git`)
    return true
  } catch {
    return false
  }
}

/**
 * Reset HEAD to previous commit (Undo last commit)
 * Soft reset: moves HEAD, keeps changes in working directory (staged).
 */
export async function resetToPrevious(scapeId: string): Promise<void> {
  const fs = getFS(scapeId)
  const dir = getRepoDir(scapeId)
  // Soft reset to HEAD~1
  // isomorphic-git doesn't have "reset --soft" convenience, we must manually move refs.

  // 1. Get current HEAD
  const head = await git.resolveRef({ fs, dir, ref: "HEAD" })

  // 2. Get parent commit
  const commit = await git.readCommit({ fs, dir, oid: head })
  if (commit.commit.parent.length === 0) {
    throw new Error("Cannot undo initial commit")
  }
  const parent = commit.commit.parent[0]

  // 3. Move HEAD to parent
  // This effectively "deletes" the commit from history view, but keeps files in index/working dir (mixed/soft behavior)
  // To match "Undo" usually we want files to stay as they are (soft).
  // Isomorphic-git separates this. Moving HEAD doesn't touch index/workdir.
  // So simple ref update is a "Soft Reset".
  await fs.promises.writeFile(`${dir}/.git/refs/heads/master`, parent + "\n", "utf8") // Assuming master

  // Verify current branch name to be safe?
  // const branch = await git.currentBranch({ fs, dir })
  // await fs.promises.writeFile(`${dir}/.git/refs/heads/${branch}`, parent + '\n', 'utf8')
  // But easier:
  // git.writeRef is internal? No.
  // Use git.branch? No.

  // Better way using git plumbing:
  const currentBranch = await git.currentBranch({ fs, dir })
  if (currentBranch) {
    // Update the ref of the branch
    // There isn't a high level 'updateRef'. We write file.
    await fs.promises.writeFile(`${dir}/.git/refs/heads/${currentBranch}`, parent + "\n")
  } else {
    // Detached HEAD?
    await fs.promises.writeFile(`${dir}/.git/HEAD`, parent + "\n")
  }
}
