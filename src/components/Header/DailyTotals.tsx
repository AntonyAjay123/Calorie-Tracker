import { round1 } from '../../utils/format';
import type { Totals } from '../../utils/totals';

interface DailyTotalsProps {
  totals: Totals;
}

const MACROS = [
  { key: 'protein', label: 'protein', dot: 'bg-protein' },
  { key: 'carbs', label: 'carbs', dot: 'bg-carb' },
  { key: 'fat', label: 'fat', dot: 'bg-fat' },
] as const;

export function DailyTotals({ totals }: DailyTotalsProps) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
      <div className="flex items-baseline gap-1.5">
        <span className="h-2 w-2 rounded-full bg-calorie" aria-hidden />
        <span className="text-4xl font-black leading-none tabular-nums text-ink">{Math.round(totals.calories)}</span>
        <span className="text-sm text-ink-muted">kcal</span>
      </div>
      <dl className="flex gap-4 text-sm">
        {MACROS.map(({ key, label, dot }) => (
          <div key={key} className="flex items-baseline gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
            <dt className="font-semibold tabular-nums text-ink">{round1(totals[key])}g</dt>
            <dd className="text-ink-muted">{label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
