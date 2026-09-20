import { useState } from 'react';
import type { Food } from '../../types';

interface FoodCardProps {
  food: Food;
  onAdd: (food: Food, quantity: number) => void;
}

export function FoodCard({ food, onAdd }: FoodCardProps) {
  const [quantity, setQuantity] = useState(1);

  const decrease = () => setQuantity((q) => Math.max(0.5, Math.round((q - 0.5) * 10) / 10));
  const increase = () => setQuantity((q) => Math.round((q + 0.5) * 10) / 10);

  return (
    <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="font-semibold text-slate-900">{food.name}</h3>
        <p className="text-sm text-slate-500">{food.servingSize}</p>
        <dl className="mt-2 grid grid-cols-4 gap-1 text-xs text-slate-600">
          <div>
            <dt className="font-medium text-slate-800">{food.calories}</dt>
            <dd>kcal</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">{food.protein}g</dt>
            <dd>protein</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">{food.carbs}g</dt>
            <dd>carbs</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800">{food.fat}g</dt>
            <dd>fat</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrease}
            aria-label={`Decrease quantity for ${food.name}`}
            className="h-7 w-7 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            −
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={increase}
            aria-label={`Increase quantity for ${food.name}`}
            className="h-7 w-7 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => onAdd(food, quantity)}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}
