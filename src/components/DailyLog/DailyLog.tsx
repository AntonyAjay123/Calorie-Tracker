import type { LogEntry } from '../../types';
import { LogEntryList } from './LogEntryList';

interface DailyLogProps {
  entries: LogEntry[];
  onRemove: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function DailyLog({ entries, onRemove, isLoading, error }: DailyLogProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink">Log</h2>
      {error ? (
        <p className="mt-3 text-protein">{error}</p>
      ) : isLoading ? (
        <p className="mt-3 text-ink-muted">Loading…</p>
      ) : (
        <LogEntryList entries={entries} onRemove={onRemove} />
      )}
    </section>
  );
}
