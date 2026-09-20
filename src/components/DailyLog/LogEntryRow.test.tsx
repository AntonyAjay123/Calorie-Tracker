import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { LogEntry } from '../../types';
import { LogEntryRow } from './LogEntryRow';

const entry: LogEntry = {
  id: 'entry-1',
  foodId: 'chicken-breast',
  foodName: 'Chicken Breast',
  quantity: 2,
  calories: 330,
  protein: 62,
  carbs: 0,
  fat: 7.2,
  servingSize: '100g',
  date: '2026-03-05',
  loggedAt: '2026-03-05T08:00:00.000Z',
};

describe('LogEntryRow', () => {
  it('renders the food name, quantity, and macros', () => {
    render(<LogEntryRow entry={entry} onRemove={() => {}} />);
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
    expect(screen.getByText('×2')).toBeInTheDocument();
    expect(screen.getByText(/330 kcal/)).toBeInTheDocument();
    expect(screen.getByText(/62g protein/)).toBeInTheDocument();
  });

  it('does not call onRemove on the first click — it asks for confirmation instead', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<LogEntryRow entry={entry} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: /remove chicken breast/i }));

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onRemove with the entry id when Confirm is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<LogEntryRow entry={entry} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: /remove chicken breast/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onRemove).toHaveBeenCalledWith('entry-1');
  });

  it('Cancel returns to the initial state without calling onRemove', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<LogEntryRow entry={entry} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: /remove chicken breast/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /remove chicken breast/i })).toBeInTheDocument();
  });
});
