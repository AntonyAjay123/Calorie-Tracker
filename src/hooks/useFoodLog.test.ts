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

const TODAY = '2026-03-05';
const YESTERDAY = '2026-03-04';

describe('useFoodLog', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 5, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no entries when storage is empty', () => {
    const { result } = renderHook(() => useFoodLog(TODAY));
    expect(result.current.entries).toEqual([]);
  });

  it('loads pre-existing entries for the given date from storage', () => {
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
          date: TODAY,
          loggedAt: '2026-03-05T08:00:00.000Z',
        },
      ]),
    );

    const { result } = renderHook(() => useFoodLog(TODAY));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].foodName).toBe('Egg');
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
          date: YESTERDAY,
          loggedAt: '2026-03-04T08:00:00.000Z',
        },
      ]),
    );

    const { result } = renderHook(() => useFoodLog(TODAY));
    expect(result.current.entries).toEqual([]);
  });

  it('addEntry scales macros by quantity, stamps the given date, and persists to storage', () => {
    const { result } = renderHook(() => useFoodLog(TODAY));

    act(() => {
      result.current.addEntry(chicken, 2);
    });

    expect(result.current.entries).toHaveLength(1);
    const entry = result.current.entries[0];
    expect(entry.calories).toBe(330);
    expect(entry.protein).toBe(62);
    expect(entry.date).toBe(TODAY);
    expect(entry.foodName).toBe('Chicken Breast');

    const persisted = JSON.parse(localStorage.getItem('calorie-tracker:log') ?? '[]');
    expect(persisted).toHaveLength(1);
    expect(persisted[0].calories).toBe(330);
  });

  it('addEntry stamps entries with whatever date the hook was called with, not always today', () => {
    const { result } = renderHook(() => useFoodLog(YESTERDAY));

    act(() => {
      result.current.addEntry(chicken, 1);
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].date).toBe(YESTERDAY);
  });

  it('removeEntry deletes the entry from state and storage', () => {
    const { result } = renderHook(() => useFoodLog(TODAY));

    act(() => {
      result.current.addEntry(chicken, 1);
    });
    const addedId = result.current.entries[0].id;

    act(() => {
      result.current.removeEntry(addedId);
    });

    expect(result.current.entries).toEqual([]);
    expect(JSON.parse(localStorage.getItem('calorie-tracker:log') ?? '[]')).toEqual([]);
  });

  it('re-scopes entries when the date argument changes, without losing entries already added (mirrors DateNav navigation)', () => {
    const { result, rerender } = renderHook(({ date }) => useFoodLog(date), {
      initialProps: { date: TODAY },
    });

    act(() => {
      result.current.addEntry(chicken, 1);
    });
    expect(result.current.entries).toHaveLength(1);

    rerender({ date: YESTERDAY });
    expect(result.current.entries).toEqual([]);

    rerender({ date: TODAY });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].foodName).toBe('Chicken Breast');
  });
});
