import type { LogEntry } from '../../types';
import { LogEntryRow } from './LogEntryRow';

interface LogEntryListProps {
  entries: LogEntry[];
  onRemove: (id: string) => void;
}

export function LogEntryList({ entries, onRemove }: LogEntryListProps) {
  if (entries.length === 0) {
    return <p className="mt-3 text-ink-muted">Nothing logged here yet — add a food above to get started.</p>;
  }

  // `entries` arrives in insertion (oldest-first) order. Reverse before the stable sort so that
  // entries with an identical `loggedAt` (e.g. two adds in the same millisecond) still end up
  // most-recently-added-first, rather than falling back to insertion order.
  const sortedByNewestFirst = [...entries].reverse().sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));

  return (
    <ul className="mt-3 border-t border-line">
      {sortedByNewestFirst.map((entry) => (
        <LogEntryRow key={entry.id} entry={entry} onRemove={onRemove} />
      ))}
    </ul>
  );
}
