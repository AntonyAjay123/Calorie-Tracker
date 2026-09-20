import { describe, expect, it } from 'vitest';
import { round1 } from './format';

describe('round1', () => {
  it('rounds to one decimal place', () => {
    expect(round1(4.36)).toBe(4.4);
    expect(round1(4.34)).toBe(4.3);
  });

  it('leaves whole numbers unchanged', () => {
    expect(round1(5)).toBe(5);
  });

  it('fixes floating-point sums like 31 + 1.3', () => {
    expect(round1(31 + 1.3)).toBe(32.3);
  });
});
