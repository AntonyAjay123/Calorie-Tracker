import type { Totals } from '../../utils/totals';
import { DailyTotals } from './DailyTotals';

interface HeaderProps {
  totals: Totals;
}

export function Header({ totals }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">Calorie Tracker</h1>
        <div className="mt-1">
          <DailyTotals totals={totals} />
        </div>
      </div>
    </header>
  );
}
