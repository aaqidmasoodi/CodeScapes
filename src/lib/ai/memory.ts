/**
 * Scapper Memory System
 *
 * Stores conversation summaries in IndexedDB for persistent memory across sessions.
 * Each scape has its own memory store with up to MAX_MEMORIES summaries.
 */

const DB_NAME = "scapper-memory"
const DB_VERSION = 1
const STORE_NAME = "memories"
const MAX_MEMORIES = 5 // Keep last 5 session summaries per scape

export interface MemoryEntry {
  id: string
  scapeId: string
  timestamp: number
  summary: string
  filesChanged: string[]
  keyDecisions: string[]
}

// --- IndexedDB Helpers ---

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("scapeId", "scapeId", { unique: false })
        store.createIndex("timestamp", "timestamp", { unique: false })
      }
    }
  })
}

// --- Public API ---

/**
 * Save a memory entry for a scape
 */
export async function saveMemory(
  scapeId: string,
  summary: string,
  filesChanged: string[] = [],
  keyDecisions: string[] = []
): Promise<void> {
  const db = await openDB()

  const entry: MemoryEntry = {
    id: `${scapeId}-${Date.now()}`,
    scapeId,
    timestamp: Date.now(),
    summary,
    filesChanged,
    keyDecisions,
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    store.add(entry)

    tx.oncomplete = () => {
      // Prune old memories after adding new one
      pruneMemories(scapeId).then(resolve).catch(reject)
    }
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Get all memories for a scape, sorted by most recent first
 */
export async function getMemories(scapeId: string): Promise<MemoryEntry[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const index = store.index("scapeId")
    const request = index.getAll(scapeId)

    request.onsuccess = () => {
      const memories = request.result as MemoryEntry[]
      // Sort by timestamp descending (most recent first)
      memories.sort((a, b) => b.timestamp - a.timestamp)
      resolve(memories)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete all memories for a scape
 */
export async function clearMemories(scapeId: string): Promise<void> {
  const memories = await getMemories(scapeId)
  if (memories.length === 0) return

  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    for (const memory of memories) {
      store.delete(memory.id)
    }

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Keep only the most recent MAX_MEMORIES entries
 */
async function pruneMemories(scapeId: string): Promise<void> {
  const memories = await getMemories(scapeId)

  if (memories.length <= MAX_MEMORIES) return

  const db = await openDB()
  const toDelete = memories.slice(MAX_MEMORIES) // Already sorted, so slice from MAX

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)

    for (const memory of toDelete) {
      store.delete(memory.id)
    }

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Format memories for injection into system prompt
 */
export function formatMemoriesForPrompt(memories: MemoryEntry[]): string {
  if (memories.length === 0) return ""

  const lines = ["**Previous Session Context:**"]

  for (const memory of memories.slice(0, 3)) {
    // Use top 3 most recent
    const date = new Date(memory.timestamp).toLocaleDateString()
    lines.push(`- [${date}] ${memory.summary}`)

    if (memory.keyDecisions.length > 0) {
      lines.push(`  Decisions: ${memory.keyDecisions.join(", ")}`)
    }
  }

  return lines.join("\n")
}
