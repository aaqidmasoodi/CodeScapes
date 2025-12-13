import Dexie, { type EntityTable } from 'dexie';

export interface Scape {
    id: number;
    name: string;
    type: string; // 'blank' | 'three' | 'p5' | 'html'
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

db.version(1).stores({
    scapes: '++id, name, type, createdAt, updatedAt',
    files: '++id, scapeId, name, [scapeId+name]' // Compound index for uniqueness within a scape
});

export { db };
