import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { todayDateString } from './date';

describe('todayDateString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
