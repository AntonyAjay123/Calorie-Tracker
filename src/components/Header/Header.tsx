import type { Totals } from '../../utils/totals';
import { DailyTotals } from './DailyTotals';

interface HeaderProps {
  totals: Totals;
}

export function Header({ totals }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b-[3px] border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <h1 className="text-sm font-semibold text-ink-muted">Calorie Tracker</h1>
        <div className="mt-1">
          <DailyTotals totals={totals} />
        </div>
      </div>
    </header>
  );
}
