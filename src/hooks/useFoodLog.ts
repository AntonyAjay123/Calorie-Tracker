import { useCallback, useEffect, useState } from 'react';
import { addEntry as apiAddEntry, getEntries, removeEntry as apiRemoveEntry } from '../lib/storage';
import type { Food, LogEntry } from '../types';

const UNREACHABLE_MESSAGE = "Couldn't reach the server. Is the backend running?";

export function useFoodLog(date: string) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getEntries(date)
      .then((fetched) => {
        if (!cancelled) setEntries(fetched);
      })
      .catch(() => {
        if (!cancelled) setError(UNREACHABLE_MESSAGE);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  const addEntry = useCallback(
    async (food: Food, quantity: number, source?: LogEntry['source']) => {
      setError(null);
      try {
        const entry = await apiAddEntry({
          foodId: food.id,
          foodName: food.name,
          quantity,
          calories: food.calories * quantity,
          protein: food.protein * quantity,
          carbs: food.carbs * quantity,
          fat: food.fat * quantity,
          servingSize: food.servingSize,
          date,
          source,
        });
        setEntries((prev) => [...prev, entry]);
      } catch {
        setError(UNREACHABLE_MESSAGE);
      }
    },
    [date],
  );

  const removeEntry = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiRemoveEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch {
      setError(UNREACHABLE_MESSAGE);
    }
  }, []);

  return { entries, isLoading, error, addEntry, removeEntry };
}
