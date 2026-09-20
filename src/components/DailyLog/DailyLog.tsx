import type { LogEntry } from '../../types';
import { LogEntryList } from './LogEntryList';

interface DailyLogProps {
  entries: LogEntry[];
  onRemove: (id: string) => void;
}

export function DailyLog({ entries, onRemove }: DailyLogProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Today's Log</h2>
      <LogEntryList entries={entries} onRemove={onRemove} />
    </section>
  );
}
