import { useCallback, useState } from 'react';
import { getEntries, saveEntries } from '../lib/storage';
import type { Food, LogEntry } from '../types';

export function useFoodLog(date: string) {
  const [allEntries, setAllEntries] = useState<LogEntry[]>(() => getEntries());

  const entries = allEntries.filter((entry) => entry.date === date);

  const addEntry = useCallback(
    (food: Food, quantity: number) => {
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        foodId: food.id,
        foodName: food.name,
        quantity,
        calories: food.calories * quantity,
        protein: food.protein * quantity,
        carbs: food.carbs * quantity,
        fat: food.fat * quantity,
        servingSize: food.servingSize,
        date,
        loggedAt: new Date().toISOString(),
      };

      setAllEntries((prev) => {
        const next = [...prev, entry];
        saveEntries(next);
        return next;
      });
    },
    [date],
  );

  const removeEntry = useCallback((id: string) => {
    setAllEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  return { entries, addEntry, removeEntry };
}
