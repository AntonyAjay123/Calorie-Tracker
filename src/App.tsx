import { FoodSearchPanel } from './components/FoodSearch/FoodSearchPanel';
import { useFoodLog } from './hooks/useFoodLog';

function App() {
  const { addEntry } = useFoodLog();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Calorie Tracker</h1>
      <p className="mt-1 text-slate-500">Search or quick-add a food to log it for today.</p>

      <div className="mt-6">
        <FoodSearchPanel onAdd={addEntry} />
      </div>
    </div>
  );
}

export default App;
