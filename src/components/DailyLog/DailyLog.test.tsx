import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { LogEntry } from '../../types';
import { DailyLog } from './DailyLog';

const entry: LogEntry = {
  id: 'entry-1',
  foodId: 'egg',
  foodName: 'Egg',
  quantity: 1,
  calories: 78,
  protein: 6.3,
  carbs: 0.6,
  fat: 5.3,
  servingSize: '1 large',
  date: '2026-03-05',
  loggedAt: '2026-03-05T08:00:00.000Z',
};

describe('DailyLog', () => {
  it('renders the section heading and the entry list', () => {
    render(<DailyLog entries={[entry]} onRemove={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Log' })).toBeInTheDocument();
    expect(screen.getByText('Egg')).toBeInTheDocument();
  });

  it('shows the empty state when there are no entries', () => {
    render(<DailyLog entries={[]} onRemove={() => {}} />);
    expect(screen.getByText(/nothing logged here yet/i)).toBeInTheDocument();
  });

  it('shows a loading message instead of entries while isLoading is true', () => {
    render(<DailyLog entries={[entry]} onRemove={() => {}} isLoading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText('Egg')).not.toBeInTheDocument();
  });

  it('shows the error message instead of entries when error is set', () => {
    render(<DailyLog entries={[entry]} onRemove={() => {}} error="Couldn't reach the server." />);
    expect(screen.getByText("Couldn't reach the server.")).toBeInTheDocument();
    expect(screen.queryByText('Egg')).not.toBeInTheDocument();
  });
});
