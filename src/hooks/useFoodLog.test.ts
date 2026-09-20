import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Food, LogEntry } from '../types';
import { useFoodLog } from './useFoodLog';

const { getEntries, addEntry: apiAddEntry, removeEntry: apiRemoveEntry } = vi.hoisted(() => ({
  getEntries: vi.fn(),
  addEntry: vi.fn(),
  removeEntry: vi.fn(),
}));

vi.mock('../lib/storage', () => ({ getEntries, addEntry: apiAddEntry, removeEntry: apiRemoveEntry }));

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

function entryFor(date: string, overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: 'existing',
    foodId: 'egg',
    foodName: 'Egg',
    quantity: 1,
    calories: 78,
    protein: 6.3,
    carbs: 0.6,
    fat: 5.3,
    servingSize: '1 large',
    date,
    loggedAt: '2026-03-05T08:00:00.000Z',
    ...overrides,
  };
}

describe('useFoodLog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 5, 12, 0, 0));
    getEntries.mockReset().mockResolvedValue([]);
    apiAddEntry.mockReset();
    apiRemoveEntry.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts loading, then resolves to no entries when the backend has nothing for the date', async () => {
    const { result } = renderHook(() => useFoodLog(TODAY));
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toEqual([]);
    expect(getEntries).toHaveBeenCalledWith(TODAY);
  });

  it('loads pre-existing entries for the given date from the backend', async () => {
    getEntries.mockResolvedValue([entryFor(TODAY)]);

    const { result } = renderHook(() => useFoodLog(TODAY));

    await waitFor(() => expect(result.current.entries).toHaveLength(1));
    expect(result.current.entries[0].foodName).toBe('Egg');
  });

  it('sets an error and stops loading when fetching entries fails', async () => {
    getEntries.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useFoodLog(TODAY));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toMatch(/couldn't reach the server/i);
  });

  it('addEntry scales macros by quantity, stamps the given date, and appends the server-returned entry', async () => {
    apiAddEntry.mockImplementation(async (entry) => ({
      ...entry,
      id: 'new-id',
      loggedAt: '2026-03-05T12:00:00.000Z',
    }));

    const { result } = renderHook(() => useFoodLog(TODAY));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addEntry(chicken, 2);
    });

    expect(apiAddEntry).toHaveBeenCalledWith(
      expect.objectContaining({ calories: 330, protein: 62, date: TODAY, foodName: 'Chicken Breast' }),
    );
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('new-id');
  });

  it('addEntry stamps entries with whatever date the hook was called with, not always today', async () => {
    apiAddEntry.mockImplementation(async (entry) => ({ ...entry, id: 'new-id', loggedAt: 'now' }));

    const { result } = renderHook(() => useFoodLog(YESTERDAY));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addEntry(chicken, 1);
    });

    expect(apiAddEntry).toHaveBeenCalledWith(expect.objectContaining({ date: YESTERDAY }));
  });

  it('sets an error and leaves entries unchanged when addEntry fails', async () => {
    apiAddEntry.mockRejectedValue(new Error('server down'));

    const { result } = renderHook(() => useFoodLog(TODAY));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addEntry(chicken, 1);
    });

    expect(result.current.entries).toEqual([]);
    expect(result.current.error).toMatch(/couldn't reach the server/i);
  });

  it('removeEntry deletes the entry from state after the backend confirms', async () => {
    getEntries.mockResolvedValue([entryFor(TODAY, { id: 'to-remove' })]);

    const { result } = renderHook(() => useFoodLog(TODAY));
    await waitFor(() => expect(result.current.entries).toHaveLength(1));

    await act(async () => {
      await result.current.removeEntry('to-remove');
    });

    expect(apiRemoveEntry).toHaveBeenCalledWith('to-remove');
    expect(result.current.entries).toEqual([]);
  });

  it('re-fetches entries when the date argument changes (mirrors DateNav navigation)', async () => {
    getEntries.mockImplementation(async (date: string) => (date === TODAY ? [entryFor(TODAY)] : []));

    const { result, rerender } = renderHook(({ date }) => useFoodLog(date), {
      initialProps: { date: TODAY },
    });
    await waitFor(() => expect(result.current.entries).toHaveLength(1));

    rerender({ date: YESTERDAY });
    await waitFor(() => expect(result.current.entries).toEqual([]));

    rerender({ date: TODAY });
    await waitFor(() => expect(result.current.entries).toHaveLength(1));
    expect(getEntries).toHaveBeenCalledWith(YESTERDAY);
  });
});
