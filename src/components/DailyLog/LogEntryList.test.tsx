import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { LogEntry } from '../../types';
import { LogEntryList } from './LogEntryList';

function makeEntry(overrides: Partial<LogEntry>): LogEntry {
  return {
    id: 'id',
    foodId: 'food',
    foodName: 'Food',
    quantity: 1,
    calories: 100,
    protein: 10,
    carbs: 10,
    fat: 10,
    servingSize: '1 serving',
    date: '2026-03-05',
    loggedAt: '2026-03-05T08:00:00.000Z',
    ...overrides,
  };
}

describe('LogEntryList', () => {
  it('shows an empty-state message when there are no entries', () => {
    render(<LogEntryList entries={[]} onRemove={() => {}} />);
    expect(screen.getByText(/nothing logged here yet/i)).toBeInTheDocument();
  });

  it('renders a row per entry, newest (by loggedAt) first', () => {
    const entries = [
      makeEntry({ id: 'a', foodName: 'First Added', loggedAt: '2026-03-05T08:00:00.000Z' }),
      makeEntry({ id: 'b', foodName: 'Second Added', loggedAt: '2026-03-05T09:00:00.000Z' }),
      makeEntry({ id: 'c', foodName: 'Third Added', loggedAt: '2026-03-05T07:00:00.000Z' }),
    ];

    render(<LogEntryList entries={entries} onRemove={() => {}} />);

    const names = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(names[0]).toContain('Second Added'); // 09:00 - newest
    expect(names[1]).toContain('First Added'); // 08:00
    expect(names[2]).toContain('Third Added'); // 07:00 - oldest
  });

  it('breaks ties on identical loggedAt by insertion order, so a same-millisecond add still lands newest-first', () => {
    const sameTimestamp = '2026-03-05T08:00:00.000Z';
    const entries = [
      makeEntry({ id: 'a', foodName: 'Added First', loggedAt: sameTimestamp }),
      makeEntry({ id: 'b', foodName: 'Added Second', loggedAt: sameTimestamp }),
    ];

    render(<LogEntryList entries={entries} onRemove={() => {}} />);

    const names = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(names[0]).toContain('Added Second');
    expect(names[1]).toContain('Added First');
  });
});
