/**
 * IndexedDB 存储服务
 */

import type { GameSave, GameSettings } from '@/shared/types';
import { DB_NAME, DB_VERSION, SAVES_STORE, SETTINGS_STORE } from '@/shared/constants';

let db: IDBDatabase | null = null;

// 初始化数据库
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(SAVES_STORE)) {
        const savesStore = database.createObjectStore(SAVES_STORE, { keyPath: 'id' });
        savesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
  });
};

// 保存游戏
export const saveGame = async (save: GameSave): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SAVES_STORE], 'readwrite');
    const store = transaction.objectStore(SAVES_STORE);
    const request = store.put(save);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 获取所有存档
export const getAllSaves = async (): Promise<GameSave[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SAVES_STORE], 'readonly');
    const store = transaction.objectStore(SAVES_STORE);
    const index = store.index('updatedAt');
    const request = index.getAll();

    request.onsuccess = () => {
      const saves = request.result.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(saves);
    };
    request.onerror = () => reject(request.error);
  });
};

// 获取单个存档
export const getSave = async (id: string): Promise<GameSave | undefined> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SAVES_STORE], 'readonly');
    const store = transaction.objectStore(SAVES_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 删除存档
export const deleteSave = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SAVES_STORE], 'readwrite');
    const store = transaction.objectStore(SAVES_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 保存设置
export const saveSettings = async (settings: GameSettings): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.put({ key: 'settings', ...settings });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 获取设置
export const getSettings = async (): Promise<GameSettings | null> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SETTINGS_STORE], 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.get('settings');

    request.onsuccess = () => {
      if (request.result) {
        const { key: _key, ...settings } = request.result;
        resolve(settings as GameSettings);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

// 生成存档 ID
export const generateSaveId = (): string => {
  return `save-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// 生成 LLM 配置 ID
export const generateLLMConfigId = (): string => {
  return `llm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// 默认设置
export const getDefaultSettings = (): GameSettings => ({
  llmConfigs: [],
  defaultLLMId: '',
});

// 获取默认 LLM 配置
export const getDefaultLLMConfig = (settings: GameSettings) => {
  if (!settings.defaultLLMId || settings.llmConfigs.length === 0) {
    return settings.llmConfigs[0] || null;
  }
  return settings.llmConfigs.find((c) => c.id === settings.defaultLLMId) || settings.llmConfigs[0] || null;
};
