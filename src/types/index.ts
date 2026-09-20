export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
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
  source?: 'catalog' | 'photo'; // omitted/'catalog' for existing entries; set by Phase 8
}
