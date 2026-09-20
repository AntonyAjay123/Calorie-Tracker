import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { foods } from '../../data/foods';
import { FoodSearchPanel } from './FoodSearchPanel';

describe('FoodSearchPanel (integration: search + filter + add wiring)', () => {
  it('shows the full food list by default', () => {
    render(<FoodSearchPanel onAdd={() => {}} />);
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^add$/i })).toHaveLength(foods.length);
  });

  it('filters the grid live as the user types, case-insensitively', async () => {
    const user = userEvent.setup();
    render(<FoodSearchPanel onAdd={() => {}} />);

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'BAN');

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Chicken Breast')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^add$/i })).toHaveLength(1);
  });

  it('shows the empty state and restores the full list when the query is cleared', async () => {
    const user = userEvent.setup();
    render(<FoodSearchPanel onAdd={() => {}} />);

    const input = screen.getByRole('textbox', { name: /search foods/i });
    await user.type(input, 'nonexistent food xyz');
    expect(screen.getByText(/no foods match your search/i)).toBeInTheDocument();

    await user.clear(input);
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^add$/i })).toHaveLength(foods.length);
  });

  it('adding a filtered food calls onAdd with the correct food and default quantity', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<FoodSearchPanel onAdd={onAdd} />);

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'salmon');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    const salmon = foods.find((f) => f.id === 'salmon');
    expect(onAdd).toHaveBeenCalledWith(salmon, 1);
  });
});
