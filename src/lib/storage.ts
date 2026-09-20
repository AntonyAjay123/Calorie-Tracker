import type { LogEntry } from '../types';

const STORAGE_KEY = 'calorie-tracker:log';

export function getEntries(): LogEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: LogEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
