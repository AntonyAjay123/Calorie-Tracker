export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  emoji: string;
}

export interface LogEntry {
  id: string; // server-generated (Python uuid.uuid4())
  foodId: string;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  date: string;
  loggedAt: string; // server-stamped ISO timestamp
  source?: 'catalog' | 'photo'; // omitted for pre-Phase-8 entries and catalog adds; 'photo' for photo-analyzed adds
}

// Returned by the backend's POST /api/analyze-food-image, not persisted as-is. PhotoResultCard
// wraps this into a synthetic Food and passes it through the existing useFoodLog().addEntry.
export interface PhotoAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string; // the AI's own estimate of what it saw, e.g. "~1 cup"
  disclaimer: string; // fixed note that this is an AI estimate, not a lab measurement
}
