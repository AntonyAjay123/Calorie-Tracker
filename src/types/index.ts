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
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  date: string;
  loggedAt: string;
}
