import { DailyLog } from './components/DailyLog/DailyLog';
import { FoodSearchPanel } from './components/FoodSearch/FoodSearchPanel';
import { Header } from './components/Header/Header';
import { useFoodLog } from './hooks/useFoodLog';
import { calculateTotals } from './utils/totals';

function App() {
  const { todayEntries, addEntry, removeEntry } = useFoodLog();
  const totals = calculateTotals(todayEntries);

  return (
    <div className="min-h-screen">
      <Header totals={totals} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Add Food</h2>
          <p className="mt-1 text-slate-500">Search or quick-add a food to log it for today.</p>
          <div className="mt-3">
            <FoodSearchPanel onAdd={addEntry} />
          </div>
        </section>

        <div className="mt-10">
          <DailyLog entries={todayEntries} onRemove={removeEntry} />
        </div>
      </main>
    </div>
  );
}

export default App;
