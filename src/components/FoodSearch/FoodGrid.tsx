import type { Food } from '../../types';
import { FoodCard } from './FoodCard';

interface FoodGridProps {
  foods: Food[];
  onAdd: (food: Food, quantity: number) => void;
}

export function FoodGrid({ foods, onAdd }: FoodGridProps) {
  if (foods.length === 0) {
    return <p className="mt-6 text-center text-ink-muted">No foods match your search.</p>;
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {foods.map((food) => (
        <FoodCard key={food.id} food={food} onAdd={onAdd} />
      ))}
    </div>
  );
}
