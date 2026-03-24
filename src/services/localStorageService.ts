import type { AppData } from '../types';

const DATA_KEY = 'taskgrid_data';

export const localStorageService = {
  load(): AppData {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (!raw) return { boards: [] };
      const parsed = JSON.parse(raw) as AppData;
      if (!Array.isArray(parsed.boards)) return { boards: [] };
      return parsed;
    } catch {
      return { boards: [] };
    }
  },

  save(data: AppData): void {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  },
};
