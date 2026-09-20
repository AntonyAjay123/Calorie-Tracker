import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DateNav } from './DateNav';

describe('DateNav', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 5, 12, 0, 0)); // "today" = 2026-03-05
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "Today" and disables the next-day button when on today', () => {
    render(<DateNav selectedDate="2026-03-05" onPrevDay={() => {}} onNextDay={() => {}} onToday={() => {}} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next day/i })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^today$/i })).not.toBeInTheDocument();
  });

  it('shows a formatted date, an enabled next-day button, and a Today jump button for a past date', () => {
    render(<DateNav selectedDate="2026-03-02" onPrevDay={() => {}} onNextDay={() => {}} onToday={() => {}} />);

    expect(screen.getByText('Mon, Mar 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next day/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /^today$/i })).toBeInTheDocument();
  });

  it('calls onPrevDay and onNextDay when their buttons are clicked', async () => {
    const user = userEvent.setup();
    const onPrevDay = vi.fn();
    const onNextDay = vi.fn();
    render(<DateNav selectedDate="2026-03-02" onPrevDay={onPrevDay} onNextDay={onNextDay} onToday={() => {}} />);

    await user.click(screen.getByRole('button', { name: /previous day/i }));
    expect(onPrevDay).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: /next day/i }));
    expect(onNextDay).toHaveBeenCalledOnce();
  });

  it('calls onToday when the Today jump button is clicked', async () => {
    const user = userEvent.setup();
    const onToday = vi.fn();
    render(<DateNav selectedDate="2026-03-02" onPrevDay={() => {}} onNextDay={() => {}} onToday={onToday} />);

    await user.click(screen.getByRole('button', { name: /^today$/i }));
    expect(onToday).toHaveBeenCalledOnce();
  });
});
