// Utility functions for localStorage management

const STORAGE_PREFIX = "ji-bajeti-";

export const StorageKeys = {
  LOGGED_IN: `${STORAGE_PREFIX}logged-in`,
  CURRENT_SCREEN: `${STORAGE_PREFIX}screen`,
  DARK_MODE: `${STORAGE_PREFIX}dark-mode`,
  CURRENCY: `${STORAGE_PREFIX}currency`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  TRANSACTIONS: `${STORAGE_PREFIX}transactions`,
  SAVINGS_GOALS: `${STORAGE_PREFIX}savings-goals`,
  BUDGETS: `${STORAGE_PREFIX}budgets`,
  USER_PROFILE: `${STORAGE_PREFIX}user-profile`,
  SHOWN_INSIGHTS: `${STORAGE_PREFIX}shown-insights`,
} as const;

// Clear all app data from localStorage
export function clearAppData() {
  Object.values(StorageKeys).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Export app data as JSON
export function exportAppData(): string {
  const data: Record<string, any> = {};
  Object.values(StorageKeys).forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  });
  return JSON.stringify(data, null, 2);
}

// Import app data from JSON
export function importAppData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
    return true;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
}

// Get storage usage info
export function getStorageInfo() {
  let totalSize = 0;
  const itemSizes: Record<string, number> = {};
  
  Object.values(StorageKeys).forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      const size = new Blob([value]).size;
      itemSizes[key] = size;
      totalSize += size;
    }
  });
  
  return {
    totalSize,
    totalSizeKB: (totalSize / 1024).toFixed(2),
    itemSizes,
    itemCount: Object.keys(itemSizes).length
  };
}
