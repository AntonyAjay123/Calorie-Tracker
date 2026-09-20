import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Food } from '../../types';
import { FoodGrid } from './FoodGrid';

const foods: Food[] = [
  { id: 'egg', name: 'Egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, servingSize: '1 large' },
  { id: 'banana', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingSize: '1 medium' },
];

describe('FoodGrid', () => {
  it('renders a card for every food', () => {
    render(<FoodGrid foods={foods} onAdd={() => {}} />);
    expect(screen.getByText('Egg')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no foods', () => {
    render(<FoodGrid foods={[]} onAdd={() => {}} />);
    expect(screen.getByText(/no foods match your search/i)).toBeInTheDocument();
  });

  it('invokes onAdd with the specific food whose Add button was clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<FoodGrid foods={foods} onAdd={onAdd} />);

    const addButtons = screen.getAllByRole('button', { name: /add/i });
    await user.click(addButtons[1]); // Banana's card

    expect(onAdd).toHaveBeenCalledWith(foods[1], 1);
  });
});
