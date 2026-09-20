import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addDays, formatDateLabel, isToday, todayDateString } from './date';

describe('date utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('todayDateString', () => {
    it('formats the current local date as YYYY-MM-DD', () => {
      vi.setSystemTime(new Date(2026, 2, 5)); // March 5, 2026 (local)
      expect(todayDateString()).toBe('2026-03-05');
    });

    it('zero-pads single-digit months and days', () => {
      vi.setSystemTime(new Date(2026, 0, 9)); // January 9, 2026 (local)
      expect(todayDateString()).toBe('2026-01-09');
    });

    it('handles December correctly', () => {
      vi.setSystemTime(new Date(2026, 11, 31)); // December 31, 2026 (local)
      expect(todayDateString()).toBe('2026-12-31');
    });
  });

  describe('addDays', () => {
    it('adds positive days, including crossing a month boundary', () => {
      expect(addDays('2026-03-30', 3)).toBe('2026-04-02');
    });

    it('subtracts days with a negative delta, including crossing a month boundary', () => {
      expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('crosses a year boundary', () => {
      expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    });

    it('returns the same date for a zero delta', () => {
      expect(addDays('2026-03-05', 0)).toBe('2026-03-05');
    });
  });

  describe('isToday', () => {
    it('returns true for the current local date', () => {
      vi.setSystemTime(new Date(2026, 2, 5));
      expect(isToday('2026-03-05')).toBe(true);
    });

    it('returns false for any other date', () => {
      vi.setSystemTime(new Date(2026, 2, 5));
      expect(isToday('2026-03-04')).toBe(false);
      expect(isToday('2026-03-06')).toBe(false);
    });
  });

  describe('formatDateLabel', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date(2026, 2, 5)); // "today" = March 5, 2026
    });

    it('labels today as "Today"', () => {
      expect(formatDateLabel('2026-03-05')).toBe('Today');
    });

    it('labels yesterday as "Yesterday"', () => {
      expect(formatDateLabel('2026-03-04')).toBe('Yesterday');
    });

    it('labels other dates as "Weekday, Mon D"', () => {
      // 2026-03-02 is a Monday
      expect(formatDateLabel('2026-03-02')).toBe('Mon, Mar 2');
    });

    it('does not mislabel a future date as yesterday', () => {
      expect(formatDateLabel('2026-03-06')).not.toBe('Yesterday');
    });
  });
});
