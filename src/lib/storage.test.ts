import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LogEntry } from '../types';
import { addEntry, getEntries, removeEntry } from './storage';

const sampleDto = {
  id: '1',
  food_id: 'egg',
  food_name: 'Egg',
  quantity: 2,
  calories: 156,
  protein: 12.6,
  carbs: 1.2,
  fat: 10.6,
  serving_size: '1 large',
  date: '2026-03-05',
  logged_at: '2026-03-05T08:00:00.000Z',
  source: null,
};

const newEntry: Omit<LogEntry, 'id' | 'loggedAt'> = {
  foodId: 'egg',
  foodName: 'Egg',
  quantity: 2,
  calories: 156,
  protein: 12.6,
  carbs: 1.2,
  fat: 10.6,
  servingSize: '1 large',
  date: '2026-03-05',
};

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 500) {
  return { ok, status, url: '/api/log', json: () => Promise.resolve(body) } as Response;
}

describe('storage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getEntries', () => {
    it('fetches entries for the given date and maps them from snake_case to LogEntry', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse([sampleDto]));

      const entries = await getEntries('2026-03-05');

      expect(fetch).toHaveBeenCalledWith('/api/log?date=2026-03-05');
      expect(entries).toEqual([
        {
          id: '1',
          foodId: 'egg',
          foodName: 'Egg',
          quantity: 2,
          calories: 156,
          protein: 12.6,
          carbs: 1.2,
          fat: 10.6,
          servingSize: '1 large',
          date: '2026-03-05',
          loggedAt: '2026-03-05T08:00:00.000Z',
        },
      ]);
    });

    it('throws when the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(null, false, 500));
      await expect(getEntries('2026-03-05')).rejects.toThrow();
    });

    it('preserves a source field when present', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse([{ ...sampleDto, source: 'photo' }]));
      const entries = await getEntries('2026-03-05');
      expect(entries[0].source).toBe('photo');
    });
  });

  describe('addEntry', () => {
    it('POSTs the entry as snake_case JSON and returns the mapped result', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(sampleDto, true, 201));

      const result = await addEntry(newEntry);

      expect(fetch).toHaveBeenCalledWith(
        '/api/log',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            food_id: 'egg',
            food_name: 'Egg',
            quantity: 2,
            calories: 156,
            protein: 12.6,
            carbs: 1.2,
            fat: 10.6,
            serving_size: '1 large',
            date: '2026-03-05',
            source: null,
          }),
        }),
      );
      expect(result.id).toBe('1');
      expect(result.loggedAt).toBe('2026-03-05T08:00:00.000Z');
    });

    it('throws when the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValue(jsonResponse(null, false, 500));
      await expect(addEntry(newEntry)).rejects.toThrow();
    });
  });

  describe('removeEntry', () => {
    it('sends a DELETE request to the entry-specific URL', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204, url: '/api/log/1' } as Response);

      await removeEntry('1');

      expect(fetch).toHaveBeenCalledWith('/api/log/1', { method: 'DELETE' });
    });

    it('throws when the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: false, status: 404, url: '/api/log/1' } as Response);
      await expect(removeEntry('1')).rejects.toThrow();
    });
  });
});
