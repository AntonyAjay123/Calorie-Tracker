import { useState } from 'react';
import type { Food, PhotoAnalysisResult } from '../../types';
import { round1 } from '../../utils/format';

interface PhotoResultCardProps {
  result: PhotoAnalysisResult;
  onAdd: (food: Food, quantity: number, source: 'photo') => void;
}

const MACRO_DOTS = [
  { key: 'protein', label: 'protein', dot: 'bg-protein' },
  { key: 'carbs', label: 'carbs', dot: 'bg-carb' },
  { key: 'fat', label: 'fat', dot: 'bg-fat' },
] as const;

// A photo-analyzed entry has no catalog Food to draw an emoji from — a camera stands in for it.
const PHOTO_EMOJI = '📷';

export function PhotoResultCard({ result, onAdd }: PhotoResultCardProps) {
  const [quantity, setQuantity] = useState(1);

  const decrease = () => setQuantity((q) => Math.max(0.5, Math.round((q - 0.5) * 10) / 10));
  const increase = () => setQuantity((q) => Math.round((q + 0.5) * 10) / 10);

  const handleAdd = () => {
    onAdd(
      {
        id: 'photo',
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        servingSize: result.servingSize,
        emoji: PHOTO_EMOJI,
      },
      quantity,
      'photo',
    );
  };

  return (
    <div className="border border-line bg-paper p-4">
      <h3 className="font-semibold text-ink">
        <span aria-hidden>{PHOTO_EMOJI}</span> {result.name}
      </h3>
      <p className="text-sm text-ink-muted">{result.servingSize}</p>

      <dl className="mt-3 flex gap-4 text-xs tabular-nums">
        <div>
          <dt className="flex items-center gap-1 font-semibold text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-calorie" aria-hidden />
            {Math.round(result.calories)}
          </dt>
          <dd className="text-ink-muted">kcal</dd>
        </div>
        {MACRO_DOTS.map(({ key, label, dot }) => (
          <div key={key}>
            <dt className="flex items-center gap-1 font-semibold text-ink">
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
              {round1(result[key])}g
            </dt>
            <dd className="text-ink-muted">{label}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs text-ink-muted">{result.disclaimer}</p>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decrease}
            aria-label={`Decrease quantity for ${result.name}`}
            className="h-7 w-7 border border-line text-ink-muted hover:border-ink hover:text-ink"
          >
            −
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={increase}
            aria-label={`Increase quantity for ${result.name}`}
            className="h-7 w-7 border border-line text-ink-muted hover:border-ink hover:text-ink"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90"
        >
          Add to log
        </button>
      </div>
    </div>
  );
}
