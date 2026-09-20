import { useState } from 'react';
import type { Food } from '../../types';

interface FoodCardProps {
  food: Food;
  onAdd: (food: Food, quantity: number) => void;
}

const MACRO_DOTS = [
  { key: 'protein', label: 'protein', dot: 'bg-protein' },
  { key: 'carbs', label: 'carbs', dot: 'bg-carb' },
  { key: 'fat', label: 'fat', dot: 'bg-fat' },
] as const;

export function FoodCard({ food, onAdd }: FoodCardProps) {
  const [quantity, setQuantity] = useState(1);

  const decrease = () => setQuantity((q) => Math.max(0.5, Math.round((q - 0.5) * 10) / 10));
  const increase = () => setQuantity((q) => Math.round((q + 0.5) * 10) / 10);

  return (
    <div className="flex flex-col justify-between border border-line bg-paper p-4">
      <div>
        <h3 className="font-semibold text-ink">
          <span aria-hidden>{food.emoji}</span> {food.name}
        </h3>
        <p className="text-sm text-ink-muted">{food.servingSize}</p>
        <dl className="mt-3 flex gap-4 text-xs tabular-nums">
          <div>
            <dt className="flex items-center gap-1 font-semibold text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-calorie" aria-hidden />
              {food.calories}
            </dt>
            <dd className="text-ink-muted">kcal</dd>
          </div>
          {MACRO_DOTS.map(({ key, label, dot }) => (
            <div key={key}>
              <dt className="flex items-center gap-1 font-semibold text-ink">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
                {food[key]}g
              </dt>
              <dd className="text-ink-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrease}
            aria-label={`Decrease quantity for ${food.name}`}
            className="h-7 w-7 border border-line text-ink-muted hover:border-ink hover:text-ink"
          >
            −
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={increase}
            aria-label={`Increase quantity for ${food.name}`}
            className="h-7 w-7 border border-line text-ink-muted hover:border-ink hover:text-ink"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => onAdd(food, quantity)}
          className="bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90"
        >
          Add
        </button>
      </div>
    </div>
  );
}
