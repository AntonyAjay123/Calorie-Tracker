import { beforeEach, describe, expect, it } from 'vitest';
import type { LogEntry } from '../types';
import { getEntries, saveEntries } from './storage';

const sampleEntry: LogEntry = {
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
};

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty array when nothing has been saved', () => {
    expect(getEntries()).toEqual([]);
  });

  it('round-trips entries through saveEntries/getEntries', () => {
    saveEntries([sampleEntry]);
    expect(getEntries()).toEqual([sampleEntry]);
  });

  it('overwrites previously saved entries on save', () => {
    saveEntries([sampleEntry]);
    saveEntries([]);
    expect(getEntries()).toEqual([]);
  });

  it('falls back to an empty array when stored JSON is corrupted', () => {
    localStorage.setItem('calorie-tracker:log', '{ not valid json');
    expect(getEntries()).toEqual([]);
  });

  it('falls back to an empty array when stored JSON is not an array', () => {
    localStorage.setItem('calorie-tracker:log', JSON.stringify({ oops: true }));
    expect(getEntries()).toEqual([]);
  });
});
