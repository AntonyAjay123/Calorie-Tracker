import { describe, expect, it } from 'vitest';
import type { LogEntry } from '../types';
import { calculateTotals } from './totals';

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: 'id',
    foodId: 'food',
    foodName: 'Food',
    quantity: 1,
    calories: 100,
    protein: 10,
    carbs: 20,
    fat: 5,
    servingSize: '1 serving',
    date: '2026-03-05',
    loggedAt: '2026-03-05T08:00:00.000Z',
    ...overrides,
  };
}

describe('calculateTotals', () => {
  it('returns all zeros for an empty list', () => {
    expect(calculateTotals([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it('sums calories/protein/carbs/fat across multiple entries', () => {
    const entries = [
      makeEntry({ calories: 165, protein: 31, carbs: 0, fat: 3.6 }),
      makeEntry({ calories: 105, protein: 1.3, carbs: 27, fat: 0.4 }),
    ];

    expect(calculateTotals(entries)).toEqual({
      calories: 270,
      protein: 32.3,
      carbs: 27,
      fat: 4,
    });
  });

  it('does not mutate the input entries', () => {
    const entries = [makeEntry()];
    const snapshot = JSON.parse(JSON.stringify(entries));
    calculateTotals(entries);
    expect(entries).toEqual(snapshot);
  });
});
