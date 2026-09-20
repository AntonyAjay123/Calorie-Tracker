import type { LogEntry } from '../types';

const BASE_URL = '/api/log';

// The backend's JSON is snake_case (idiomatic Python/REST); this module is the boundary that
// translates to/from the camelCase `LogEntry` type used everywhere else in the frontend.
interface LogEntryDto {
  id: string;
  food_id: string;
  food_name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
  date: string;
  logged_at: string;
  source: 'catalog' | 'photo' | null;
}

function fromDto(dto: LogEntryDto): LogEntry {
  return {
    id: dto.id,
    foodId: dto.food_id,
    foodName: dto.food_name,
    quantity: dto.quantity,
    calories: dto.calories,
    protein: dto.protein,
    carbs: dto.carbs,
    fat: dto.fat,
    servingSize: dto.serving_size,
    date: dto.date,
    loggedAt: dto.logged_at,
    ...(dto.source ? { source: dto.source } : {}),
  };
}

async function parseOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request to ${response.url} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getEntries(date: string): Promise<LogEntry[]> {
  const response = await fetch(`${BASE_URL}?date=${encodeURIComponent(date)}`);
  const dtos = await parseOrThrow<LogEntryDto[]>(response);
  return dtos.map(fromDto);
}

export type NewLogEntry = Omit<LogEntry, 'id' | 'loggedAt'>;

export async function addEntry(entry: NewLogEntry): Promise<LogEntry> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      food_id: entry.foodId,
      food_name: entry.foodName,
      quantity: entry.quantity,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      serving_size: entry.servingSize,
      date: entry.date,
      source: entry.source ?? null,
    }),
  });
  const dto = await parseOrThrow<LogEntryDto>(response);
  return fromDto(dto);
}

export async function removeEntry(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Request to ${response.url} failed with status ${response.status}`);
  }
}
