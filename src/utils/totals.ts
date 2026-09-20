import type { LogEntry } from '../types';

export interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function calculateTotals(entries: LogEntry[]): Totals {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
