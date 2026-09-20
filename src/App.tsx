import { useState } from 'react';
import { DailyLog } from './components/DailyLog/DailyLog';
import { DateNav } from './components/DateNav/DateNav';
import { FoodSearchPanel } from './components/FoodSearch/FoodSearchPanel';
import { Header } from './components/Header/Header';
import { useFoodLog } from './hooks/useFoodLog';
import { addDays, isToday, todayDateString } from './utils/date';
import { calculateTotals } from './utils/totals';

function App() {
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const { entries, addEntry, removeEntry } = useFoodLog(selectedDate);
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
            Search or quick-add a food to log it for {isToday(selectedDate) ? 'today' : 'this day'}.
          </p>
          <div className="mt-3">
            <FoodSearchPanel onAdd={addEntry} />
          </div>
        </section>

        <div className="mt-10">
          <DailyLog entries={entries} onRemove={removeEntry} />
        </div>
      </main>
    </div>
  );
}

export default App;
