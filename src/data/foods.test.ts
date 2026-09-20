import { describe, expect, it } from 'vitest';
import { foods } from './foods';

describe('foods', () => {
  it('has at least 20 catalog foods', () => {
    expect(foods.length).toBeGreaterThanOrEqual(20);
  });

  it('gives every food a non-empty emoji', () => {
    for (const food of foods) {
      expect(food.emoji, `${food.name} is missing an emoji`).toBeTruthy();
    }
  });

  it('has unique ids', () => {
    const ids = foods.map((food) => food.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
