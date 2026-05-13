const DB_NAME = 'mooring-booking-offline';
const DB_VERSION = 1;
const STORE_MOORINGS = 'moorings';
const STORE_META = 'meta';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_MOORINGS)) {
        db.createObjectStore(STORE_MOORINGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMooringsOffline(moorings: unknown[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_MOORINGS, STORE_META], 'readwrite');
  const store = tx.objectStore(STORE_MOORINGS);
  const meta = tx.objectStore(STORE_META);

  store.clear();
  for (const m of moorings) {
    store.put(m);
  }
  meta.put({ key: 'lastSync', value: Date.now() });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getMooringsOffline<T = unknown>(): Promise<T[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_MOORINGS, 'readonly');
  const store = tx.objectStore(STORE_MOORINGS);
  const req = store.getAll();

  return new Promise((resolve, reject) => {
    req.onsuccess = () => { db.close(); resolve(req.result as T[]); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

export async function getOfflineTimestamp(): Promise<number | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_META, 'readonly');
  const store = tx.objectStore(STORE_META);
  const req = store.get('lastSync');

  return new Promise((resolve, reject) => {
    req.onsuccess = () => { db.close(); resolve(req.result?.value ?? null); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

export async function clearOfflineData(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_MOORINGS, STORE_META], 'readwrite');
  tx.objectStore(STORE_MOORINGS).clear();
  tx.objectStore(STORE_META).clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
