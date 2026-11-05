import { openDB } from 'idb';

const DB_NAME = 'AlSaeedPlatformDB';
const DB_VERSION = 1;

export async function initLocalDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('students')) {
        db.createObjectStore('students', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('attendance')) {
        db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('offlineQueue')) {
        db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveStudentsLocally(students: any[]) {
  const db = await initLocalDb();
  const tx = db.transaction('students', 'readwrite');
  await Promise.all(students.map(s => tx.store.put(s)));
  await tx.done;
}

export async function getLocalStudents() {
  const db = await initLocalDb();
  return db.getAll('students');
}

export async function queueOfflineAction(actionType: string, payload: any) {
  const db = await initLocalDb();
  await db.add('offlineQueue', {
    actionType,
    payload,
    timestamp: new Date().toISOString()
  });
}
