import type { PhotoAnalysisResult } from '../types';

// Mirrors backend/app/routers/analyze.py's own limits, for instant client-side feedback
// before the round-trip; the backend still enforces these regardless.
export const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

export class PhotoAnalysisError extends Error {}

interface FoodAnalysisResultDto {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
  disclaimer: string;
}

export async function analyzeFoodImage(file: File): Promise<PhotoAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/analyze-food-image', { method: 'POST', body: formData });

  if (!response.ok) {
    throw new PhotoAnalysisError((await extractDetail(response)) ?? `Request failed with status ${response.status}`);
  }

  const dto: FoodAnalysisResultDto = await response.json();
  return {
    name: dto.name,
    calories: dto.calories,
    protein: dto.protein,
    carbs: dto.carbs,
    fat: dto.fat,
    servingSize: dto.serving_size,
    disclaimer: dto.disclaimer,
  };
}

// FastAPI's default HTTPException body is {"detail": "..."}; surfacing it gives a specific
// message ("Unsupported image type...", "Image too large...") instead of a bare status code.
async function extractDetail(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    const detail = (body as { detail?: unknown } | null)?.detail;
    return typeof detail === 'string' ? detail : undefined;
  } catch {
    return undefined;
  }
}
