import { useCallback, useState } from 'react';
import { getEntries, saveEntries } from '../lib/storage';
import type { Food, LogEntry } from '../types';
import { todayDateString } from '../utils/date';

export function useFoodLog() {
  const [entries, setEntries] = useState<LogEntry[]>(() => getEntries());

  const todayEntries = entries.filter((entry) => entry.date === todayDateString());

  const addEntry = useCallback((food: Food, quantity: number) => {
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
      date: todayDateString(),
      loggedAt: new Date().toISOString(),
    };

    setEntries((prev) => {
      const next = [...prev, entry];
      saveEntries(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  return { todayEntries, addEntry, removeEntry };
}
