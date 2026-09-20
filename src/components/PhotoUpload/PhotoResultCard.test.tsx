import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PhotoAnalysisResult } from '../../types';
import { PhotoResultCard } from './PhotoResultCard';

const result: PhotoAnalysisResult = {
  name: 'Banana',
  calories: 105.4,
  protein: 1.3,
  carbs: 27,
  fat: 0.4,
  servingSize: '1 medium',
  disclaimer: 'AI estimate from a photo — not a substitute for a lab measurement.',
};

describe('PhotoResultCard', () => {
  it('renders the name, serving size, rounded calories, macros, and disclaimer', () => {
    render(<PhotoResultCard result={result} onAdd={() => {}} />);

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('1 medium')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
    expect(screen.getByText('27g')).toBeInTheDocument();
    expect(screen.getByText(result.disclaimer)).toBeInTheDocument();
  });

  it('defaults to a quantity of 1 and calls onAdd with a synthetic Food, quantity, and source "photo"', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<PhotoResultCard result={result} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /add to log/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Banana',
        calories: 105.4,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        servingSize: '1 medium',
      }),
      1,
      'photo',
    );
  });

  it('scales the quantity via the stepper before adding', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<PhotoResultCard result={result} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /increase quantity/i }));
    await user.click(screen.getByRole('button', { name: /add to log/i }));

    expect(onAdd).toHaveBeenCalledWith(expect.anything(), 1.5, 'photo');
  });

  it('does not let quantity go below 0.5', async () => {
    const user = userEvent.setup();
    render(<PhotoResultCard result={result} onAdd={() => {}} />);

    const decrease = screen.getByRole('button', { name: /decrease quantity/i });
    await user.click(decrease);
    await user.click(decrease);

    expect(screen.getByText('0.5')).toBeInTheDocument();
  });
});
