import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SiwesDB extends DBSchema {
  'offline-logs': {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      payload: any;
      timestamp: number;
    };
  };
  'offline-todos': {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      payload: any;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<SiwesDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<SiwesDB>('siwes-offline-db', 1, {
    upgrade(db) {
      db.createObjectStore('offline-logs', { keyPath: 'id' });
      db.createObjectStore('offline-todos', { keyPath: 'id' });
    },
  });
}

// Logs
export async function saveOfflineLog(action: 'create' | 'update' | 'delete', payload: any) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const id = payload._id || payload.id || `temp_${Date.now()}`;
  await db.put('offline-logs', { id, action, payload, timestamp: Date.now() });
}

export async function getOfflineLogs() {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return await db.getAll('offline-logs');
}

export async function clearOfflineLog(id: string) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('offline-logs', id);
}

// Todos
export async function saveOfflineTodo(action: 'create' | 'update' | 'delete', payload: any) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const id = payload._id || payload.id || `temp_${Date.now()}`;
  await db.put('offline-todos', { id, action, payload, timestamp: Date.now() });
}

export async function getOfflineTodos() {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return await db.getAll('offline-todos');
}

export async function clearOfflineTodo(id: string) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('offline-todos', id);
}
