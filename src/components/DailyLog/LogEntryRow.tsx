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
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="font-medium text-slate-900">
          {entry.foodName} <span className="text-sm font-normal text-slate-500">×{entry.quantity}</span>
        </p>
        <p className="text-sm text-slate-500">
          {Math.round(entry.calories)} kcal · {round1(entry.protein)}g protein · {round1(entry.carbs)}g carbs ·{' '}
          {round1(entry.fat)}g fat
        </p>
      </div>

      {confirming ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="rounded bg-red-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-red-700"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded border border-slate-300 px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Remove ${entry.foodName} from today's log`}
          className="shrink-0 rounded border border-slate-300 px-2.5 py-1 text-sm text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        >
          Remove
        </button>
      )}
    </li>
  );
}
