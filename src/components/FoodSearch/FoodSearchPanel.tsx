import { useMemo, useState } from 'react';
import { foods } from '../../data/foods';
import type { Food } from '../../types';
import { FoodGrid } from './FoodGrid';
import { SearchBar } from './SearchBar';

interface FoodSearchPanelProps {
  onAdd: (food: Food, quantity: number) => void;
}

export function FoodSearchPanel({ onAdd }: FoodSearchPanelProps) {
  const [query, setQuery] = useState('');

  const filteredFoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return foods;
    return foods.filter((food) => food.name.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <section>
      <SearchBar value={query} onChange={setQuery} />
      <FoodGrid foods={filteredFoods} onAdd={onAdd} />
    </section>
  );
}
