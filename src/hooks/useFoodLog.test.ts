import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Food } from '../types';
import { useFoodLog } from './useFoodLog';

const chicken: Food = {
  id: 'chicken-breast',
  name: 'Chicken Breast',
  calories: 165,
  protein: 31,
  carbs: 0,
  fat: 3.6,
  servingSize: '100g',
};

describe('useFoodLog', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 5, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no entries when storage is empty', () => {
    const { result } = renderHook(() => useFoodLog());
    expect(result.current.todayEntries).toEqual([]);
  });

  it('loads pre-existing entries for today from storage', () => {
    localStorage.setItem(
      'calorie-tracker:log',
      JSON.stringify([
        {
          id: 'existing',
          foodId: 'egg',
          foodName: 'Egg',
          quantity: 1,
          calories: 78,
          protein: 6.3,
          carbs: 0.6,
          fat: 5.3,
          servingSize: '1 large',
          date: '2026-03-05',
          loggedAt: '2026-03-05T08:00:00.000Z',
        },
      ]),
    );

    const { result } = renderHook(() => useFoodLog());
    expect(result.current.todayEntries).toHaveLength(1);
    expect(result.current.todayEntries[0].foodName).toBe('Egg');
  });

  it('excludes entries from other dates', () => {
    localStorage.setItem(
      'calorie-tracker:log',
      JSON.stringify([
        {
          id: 'yesterday',
          foodId: 'egg',
          foodName: 'Egg',
          quantity: 1,
          calories: 78,
          protein: 6.3,
          carbs: 0.6,
          fat: 5.3,
          servingSize: '1 large',
          date: '2026-03-04',
          loggedAt: '2026-03-04T08:00:00.000Z',
        },
      ]),
    );

    const { result } = renderHook(() => useFoodLog());
    expect(result.current.todayEntries).toEqual([]);
  });

  it('addEntry scales macros by quantity, stamps today, and persists to storage', () => {
    const { result } = renderHook(() => useFoodLog());

    act(() => {
      result.current.addEntry(chicken, 2);
    });

    expect(result.current.todayEntries).toHaveLength(1);
    const entry = result.current.todayEntries[0];
    expect(entry.calories).toBe(330);
    expect(entry.protein).toBe(62);
    expect(entry.date).toBe('2026-03-05');
    expect(entry.foodName).toBe('Chicken Breast');

    const persisted = JSON.parse(localStorage.getItem('calorie-tracker:log') ?? '[]');
    expect(persisted).toHaveLength(1);
    expect(persisted[0].calories).toBe(330);
  });

  it('removeEntry deletes the entry from state and storage', () => {
    const { result } = renderHook(() => useFoodLog());

    act(() => {
      result.current.addEntry(chicken, 1);
    });
    const addedId = result.current.todayEntries[0].id;

    act(() => {
      result.current.removeEntry(addedId);
    });

    expect(result.current.todayEntries).toEqual([]);
    expect(JSON.parse(localStorage.getItem('calorie-tracker:log') ?? '[]')).toEqual([]);
  });
});
