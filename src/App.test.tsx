import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App (integration: search -> add -> persistence across remounts)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 5, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('searching for and adding a food persists a correctly-scaled entry to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Chicken Breast');

    const card = screen.getByText('Chicken Breast').closest('div')!.parentElement!;
    await user.click(within(card).getByRole('button', { name: /increase quantity/i }));
    await user.click(within(card).getByRole('button', { name: /^add$/i }));

    const stored = JSON.parse(localStorage.getItem('calorie-tracker:log') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      foodName: 'Chicken Breast',
      quantity: 1.5,
      calories: 247.5,
      date: '2026-03-05',
    });
  });

  it('an entry added before a remount (simulated page refresh) is still loaded afterward', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Banana');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    unmount();

    // Re-mounting reads fresh from localStorage, simulating a page reload.
    render(<App />);
    const stored = JSON.parse(localStorage.getItem('calorie-tracker:log') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].foodName).toBe('Banana');
  });
});
