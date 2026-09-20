import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('renders the app title and the daily totals', () => {
    render(<Header totals={{ calories: 500, protein: 30, carbs: 40, fat: 10 }} />);
    expect(screen.getByRole('heading', { name: 'Calorie Tracker' })).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('30g')).toBeInTheDocument();
  });
});
