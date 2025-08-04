// lib/storage.ts

const DB_NAME = 'HealthPlannerDB';
const DB_VERSION = 1;

class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // User profiles store
        if (!db.objectStoreNames.contains('userProfiles')) {
          db.createObjectStore('userProfiles', { keyPath: 'id' });
        }

        // Partners store
        if (!db.objectStoreNames.contains('partners')) {
          db.createObjectStore('partners', { keyPath: 'id' });
        }

        // Food lists store
        if (!db.objectStoreNames.contains('foodLists')) {
          db.createObjectStore('foodLists', { keyPath: 'userId' });
        }

        // Health plans store
        if (!db.objectStoreNames.contains('healthPlans')) {
          const healthPlansStore = db.createObjectStore('healthPlans', { keyPath: 'id' });
          healthPlansStore.createIndex('userId', 'userId');
        }

        // Daily check-ins store
        if (!db.objectStoreNames.contains('dailyCheckIns')) {
          const checkInsStore = db.createObjectStore('dailyCheckIns', { keyPath: 'id' });
          checkInsStore.createIndex('userId', 'userId');
          checkInsStore.createIndex('date', 'date');
        }

        // App settings store
        if (!db.objectStoreNames.contains('appSettings')) {
          db.createObjectStore('appSettings', { keyPath: 'id' });
        }

        // Recipes store
        if (!db.objectStoreNames.contains('recipes')) {
          const recipesStore = db.createObjectStore('recipes', { keyPath: 'userId' });
        }

        // Activities store
        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'userId' });
        }
      };
    });
  }

  async store<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new IndexedDBStorage();