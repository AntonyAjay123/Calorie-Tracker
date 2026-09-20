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

  it('adding a food updates the header totals and shows it in the daily log', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/nothing logged yet today/i)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Chicken Breast');
    const card = screen.getByText('Chicken Breast').closest('div')!.parentElement!;
    await user.click(within(card).getByRole('button', { name: /increase quantity/i }));
    await user.click(within(card).getByRole('button', { name: /^add$/i }));

    // Header total: 165 kcal * 1.5 = 247.5 -> rounded to 248
    expect(screen.getByText('248')).toBeInTheDocument();

    const log = screen.getByRole('heading', { name: "Today's Log" }).closest('section')!;
    expect(within(log).getByText('Chicken Breast')).toBeInTheDocument();
    expect(within(log).getByText('×1.5')).toBeInTheDocument();
  });

  it('adding two foods lists the most recently added one first, and removing it (with confirm) restores the total', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Egg');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await user.clear(screen.getByRole('textbox', { name: /search foods/i }));

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Banana');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    const log = screen.getByRole('heading', { name: "Today's Log" }).closest('section')!;
    const rows = within(log).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Banana'); // added second -> newest first
    expect(rows[1]).toHaveTextContent('Egg');

    // Remove Banana, which requires a confirm click.
    await user.click(within(rows[0]).getByRole('button', { name: /remove banana/i }));
    await user.click(within(log).getByRole('button', { name: /confirm/i }));

    const remainingRows = within(log).getAllByRole('listitem');
    expect(remainingRows).toHaveLength(1);
    expect(remainingRows[0]).toHaveTextContent('Egg');
    expect(screen.getByText('78')).toBeInTheDocument(); // just Egg's calories remain
  });
});
