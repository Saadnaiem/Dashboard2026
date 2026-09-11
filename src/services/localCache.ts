/**
 * Highly performant browser-side IndexedDB cache utility.
 * Since sales datasets can be 50MB-200MB (280k+ rows), LocalStorage is too small (capped at 5MB).
 * IndexedDB provides seamless key-value storage for large datasets (backed by disk space).
 */

const DB_NAME = 'PharmacyAnalyticsDB';
const STORE_NAME = 'sales_records';
const METADATA_STORE = 'metadata';
const DB_VERSION = 1;

interface IndexedDBCache {
    openDB(): Promise<IDBDatabase>;
    getCachedSales(): Promise<any[] | null>;
    setCachedSales(records: any[]): Promise<void>;
    getCachedCount(): Promise<number>;
    clearCache(): Promise<void>;
}

export const dbCache: IndexedDBCache = {
    openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(METADATA_STORE)) {
                    db.createObjectStore(METADATA_STORE);
                }
            };
        });
    },

    async getCachedSales(): Promise<any[] | null> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    const result = request.result;
                    if (result && result.length > 0) {
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (err) {
            console.error('IndexedDB read failed:', err);
            return null;
        }
    },

    async setCachedSales(records: any[]): Promise<void> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                // We clear existing rows first to prevent key duplication
                const transaction = db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
                
                const store = transaction.objectStore(STORE_NAME);
                store.clear();

                // Put all items
                for (const row of records) {
                    store.put(row);
                }

                const metaStore = transaction.objectStore(METADATA_STORE);
                metaStore.put(records.length, 'total_count');
                metaStore.put(Date.now(), 'last_synced_at');

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (err) {
            console.error('IndexedDB write failed:', err);
        }
    },

    async getCachedCount(): Promise<number> {
        try {
            const db = await this.openDB();
            return new Promise((resolve) => {
                const transaction = db.transaction(METADATA_STORE, 'readonly');
                const store = transaction.objectStore(METADATA_STORE);
                const request = store.get('total_count');

                request.onsuccess = () => resolve(request.result || 0);
                request.onerror = () => resolve(0);
            });
        } catch (err) {
            return 0;
        }
    },

    async clearCache(): Promise<void> {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
                transaction.objectStore(STORE_NAME).clear();
                transaction.objectStore(METADATA_STORE).clear();
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (err) {
            console.error('IndexedDB clear failed:', err);
        }
    }
};

export default dbCache;
