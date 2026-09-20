import { formatDateLabel, isToday } from '../../utils/date';

interface DateNavProps {
  selectedDate: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DateNav({ selectedDate, onPrevDay, onNextDay, onToday }: DateNavProps) {
  const atToday = isToday(selectedDate);

  return (
    <div className="flex items-center justify-center gap-3 border-b border-line bg-paper px-4 py-2 text-sm">
      <button
        type="button"
        onClick={onPrevDay}
        aria-label="Previous day"
        className="rounded px-2 py-1 text-lg leading-none text-ink-muted hover:bg-line/60 hover:text-ink"
      >
        ‹
      </button>
      <span className="min-w-[9rem] text-center font-semibold text-ink">{formatDateLabel(selectedDate)}</span>
      {!atToday && (
        <button
          type="button"
          onClick={onToday}
          className="rounded px-2 py-1 text-ink-muted underline decoration-line underline-offset-2 hover:text-ink"
        >
          Today
        </button>
      )}
      <button
        type="button"
        onClick={onNextDay}
        disabled={atToday}
        aria-label="Next day"
        className="rounded px-2 py-1 text-lg leading-none text-ink-muted hover:bg-line/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ›
      </button>
    </div>
  );
}
