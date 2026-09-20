import { useState } from 'react';
import { DailyLog } from './components/DailyLog/DailyLog';
import { DateNav } from './components/DateNav/DateNav';
import { FoodSearchPanel } from './components/FoodSearch/FoodSearchPanel';
import { Header } from './components/Header/Header';
import { PhotoUploadPanel } from './components/PhotoUpload/PhotoUploadPanel';
import { useFoodLog } from './hooks/useFoodLog';
import { addDays, isToday, todayDateString } from './utils/date';
import { calculateTotals } from './utils/totals';

type AddMode = 'search' | 'photo';

function App() {
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const [addMode, setAddMode] = useState<AddMode>('search');
  const { entries, isLoading, error, addEntry, removeEntry } = useFoodLog(selectedDate);
  const totals = calculateTotals(entries);

  return (
    <div className="min-h-screen">
      <Header totals={totals} />
      <DateNav
        selectedDate={selectedDate}
        onPrevDay={() => setSelectedDate((date) => addDays(date, -1))}
        onNextDay={() => setSelectedDate((date) => addDays(date, 1))}
        onToday={() => setSelectedDate(todayDateString())}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section>
          <h2 className="text-lg font-semibold text-ink">Add Food</h2>
          <p className="mt-1 text-ink-muted">
            Search, quick-add, or snap a photo of a food to log it for {isToday(selectedDate) ? 'today' : 'this day'}.
          </p>

          <div className="mt-3 inline-flex border border-line">
            <button
              type="button"
              onClick={() => setAddMode('search')}
              aria-pressed={addMode === 'search'}
              className={`border-r border-line px-3 py-1.5 text-sm font-medium ${
                addMode === 'search' ? 'bg-ink text-paper' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setAddMode('photo')}
              aria-pressed={addMode === 'photo'}
              className={`px-3 py-1.5 text-sm font-medium ${
                addMode === 'photo' ? 'bg-ink text-paper' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Photo
            </button>
          </div>

          {addMode === 'search' ? (
            <div className="mt-3">
              <FoodSearchPanel onAdd={addEntry} />
            </div>
          ) : (
            <PhotoUploadPanel onAdd={addEntry} />
          )}
        </section>

        <div className="mt-10">
          <DailyLog entries={entries} onRemove={removeEntry} isLoading={isLoading} error={error} />
        </div>
      </main>
    </div>
  );
}

export default App;
