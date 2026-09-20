import { useState } from 'react';
import type { LogEntry } from '../../types';
import { round1 } from '../../utils/format';

interface LogEntryRowProps {
  entry: LogEntry;
  onRemove: (id: string) => void;
}

export function LogEntryRow({ entry, onRemove }: LogEntryRowProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
      <div>
        <p className="font-medium text-ink">
          {entry.foodName} <span className="text-sm font-normal text-ink-muted">×{entry.quantity}</span>
        </p>
        <p className="text-sm tabular-nums text-ink-muted">
          {Math.round(entry.calories)} kcal · {round1(entry.protein)}g protein · {round1(entry.carbs)}g carbs ·{' '}
          {round1(entry.fat)}g fat
        </p>
      </div>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="bg-protein px-2.5 py-1 text-sm font-medium text-paper hover:bg-protein/90"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="border border-line px-2.5 py-1 text-sm text-ink-muted hover:border-ink hover:text-ink"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Remove ${entry.foodName} from the log`}
          className="shrink-0 border border-line px-2.5 py-1 text-sm text-ink-muted hover:border-protein hover:text-protein"
        >
          Remove
        </button>
      )}
    </li>
  );
}
