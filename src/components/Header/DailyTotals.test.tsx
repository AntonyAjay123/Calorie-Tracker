import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DailyTotals } from './DailyTotals';

describe('DailyTotals', () => {
  it('renders zeros when totals are empty', () => {
    render(<DailyTotals totals={{ calories: 0, protein: 0, carbs: 0, fat: 0 }} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('kcal')).toBeInTheDocument();
  });

  it('rounds calories to the nearest whole number and macros to one decimal', () => {
    render(<DailyTotals totals={{ calories: 366.4, protein: 25.3, carbs: 42, fat: 12.649 }} />);
    expect(screen.getByText('366')).toBeInTheDocument();
    expect(screen.getByText('25.3g')).toBeInTheDocument();
    expect(screen.getByText('42g')).toBeInTheDocument();
    expect(screen.getByText('12.6g')).toBeInTheDocument();
  });
});
