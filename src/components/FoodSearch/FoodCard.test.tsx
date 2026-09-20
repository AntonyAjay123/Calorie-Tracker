import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Food } from '../../types';
import { FoodCard } from './FoodCard';

const banana: Food = {
  id: 'banana',
  name: 'Banana',
  calories: 105,
  protein: 1.3,
  carbs: 27,
  fat: 0.4,
  servingSize: '1 medium',
};

describe('FoodCard', () => {
  it('renders the food name, serving size, and macros', () => {
    render(<FoodCard food={banana} onAdd={() => {}} />);
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('1 medium')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
    expect(screen.getByText('27g')).toBeInTheDocument();
  });

  it('defaults to a quantity of 1 and calls onAdd with the food and quantity', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<FoodCard food={banana} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(onAdd).toHaveBeenCalledWith(banana, 1);
  });

  it('increases and decreases quantity via the stepper, and Add uses the updated quantity', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<FoodCard food={banana} onAdd={onAdd} />);

    const increase = screen.getByRole('button', { name: /increase quantity/i });
    await user.click(increase);
    await user.click(increase);
    expect(screen.getByText('2')).toBeInTheDocument();

    const decrease = screen.getByRole('button', { name: /decrease quantity/i });
    await user.click(decrease);
    expect(screen.getByText('1.5')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith(banana, 1.5);
  });

  it('does not let quantity go below 0.5', async () => {
    const user = userEvent.setup();
    render(<FoodCard food={banana} onAdd={() => {}} />);

    const decrease = screen.getByRole('button', { name: /decrease quantity/i });
    await user.click(decrease); // 1 -> 0.5
    await user.click(decrease); // should clamp at 0.5

    expect(screen.getByText('0.5')).toBeInTheDocument();
  });
});
