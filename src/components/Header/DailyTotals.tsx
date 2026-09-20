import { round1 } from '../../utils/format';
import type { Totals } from '../../utils/totals';

interface DailyTotalsProps {
  totals: Totals;
}

export function DailyTotals({ totals }: DailyTotalsProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <div>
        <span className="text-3xl font-bold text-slate-900">{Math.round(totals.calories)}</span>
        <span className="ml-1.5 text-sm text-slate-500">kcal today</span>
      </div>
      <dl className="flex gap-3 text-sm text-slate-600">
        <div className="flex items-baseline gap-1">
          <dt className="font-medium text-slate-800">{round1(totals.protein)}g</dt>
          <dd>protein</dd>
        </div>
        <div className="flex items-baseline gap-1">
          <dt className="font-medium text-slate-800">{round1(totals.carbs)}g</dt>
          <dd>carbs</dd>
        </div>
        <div className="flex items-baseline gap-1">
          <dt className="font-medium text-slate-800">{round1(totals.fat)}g</dt>
          <dd>fat</dd>
        </div>
      </dl>
    </div>
  );
}
