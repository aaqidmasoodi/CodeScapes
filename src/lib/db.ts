import Dexie, { type EntityTable } from 'dexie';

export interface Scape {
    id: number;
    name: string;
    type: string; // 'blank' | 'three' | 'p5' | 'html'
    source: 'local' | 'cloud';
    syncStatus?: 'synced' | 'dirty' | 'offline';
    authorId?: string;
    cloudId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface File {
    id: number;
    scapeId: number;
    name: string;
    content: string;
    language: string;
}

const db = new Dexie('CodeScapeDB') as Dexie & {
    scapes: EntityTable<Scape, 'id'>;
    files: EntityTable<File, 'id'>;
};

// Version 2: Added source, syncStatus, authorId, cloudId
db.version(2).stores({
    scapes: '++id, name, type, source, createdAt, updatedAt', // Added source to index
    files: '++id, scapeId, name, [scapeId+name]'
}).upgrade(tx => {
    // Migration: Set default source to 'local' for existing scapes
    return tx.table('scapes').toCollection().modify(scape => {
        scape.source = 'local';
        scape.syncStatus = 'offline';
    });
});


// Helper to delete a scape and its files transactionally
export async function deleteScape(id: number) {
    await db.transaction('rw', db.scapes, db.files, async () => {
        await db.files.where('scapeId').equals(id).delete();
        await db.scapes.delete(id);
    });
}

export { db };
