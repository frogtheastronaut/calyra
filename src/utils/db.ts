// IndexedDB utility for persisting table data

const DB_NAME = 'CalyraDB';
const DB_VERSION = 2;
const STORE_NAME = 'tables';

export type TableData = {
  [key: string]: string;
};

export type TableSchema = {
  columns: string[];
  data: TableData[];
};

export type AppState = {
  titles: string[];
  tableSchemas: { [key: number]: TableSchema };
};

export type MonthlyExport = {
  month: string; // Format: YYYY-MM
  tableTitle: string;
  columnName: string;
  chartData: { date: string; value: number }[];
  generatedAt: number; // timestamp
};

const EXPORTS_STORE_NAME = 'exports';

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      
      if (!db.objectStoreNames.contains(EXPORTS_STORE_NAME)) {
        db.createObjectStore(EXPORTS_STORE_NAME);
      }
    };
  });
};

// Save app state to IndexedDB
export const saveAppState = async (state: AppState): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(state, 'appState');

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};

// Load app state from IndexedDB
export const loadAppState = async (): Promise<AppState | null> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('appState');

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
};

// Clear all data from IndexedDB
export const clearAppState = async (): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};

// Save monthly export to IndexedDB
export const saveMonthlyExport = async (exportData: MonthlyExport): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EXPORTS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(EXPORTS_STORE_NAME);
    const key = `${exportData.month}_${exportData.tableTitle}_${exportData.columnName}`;
    const request = store.put(exportData, key);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};

// Get monthly export from IndexedDB
export const getMonthlyExport = async (month: string, tableTitle: string, columnName: string): Promise<MonthlyExport | null> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EXPORTS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(EXPORTS_STORE_NAME);
    const key = `${month}_${tableTitle}_${columnName}`;
    const request = store.get(key);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
};

// Delete the entire database (backdoor function for resetting)
export const deleteDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('✅ Calyra database deleted successfully. Refresh the page to start fresh!');
      resolve();
    };

    request.onblocked = () => {
      console.warn('⚠️ Database deletion blocked. Please close all tabs with Calyra open and try again.');
    };
  });
};

// Expose reset function to window for console access
if (typeof window !== 'undefined') {
  (window as Window & { rstc?: () => Promise<void> }).rstc = async () => {
    try {
      await deleteDatabase();
      console.log('🔄 Reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('❌ Failed to reset Calyra:', error);
    }
  };
}
