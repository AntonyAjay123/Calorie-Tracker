import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analyzeFoodImage, PhotoAnalysisError } from './photoAnalysis';

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 500): Response {
  return { ok, status, json: () => Promise.resolve(body) } as Response;
}

const sampleFile = new File(['fake-bytes'], 'plate.jpg', { type: 'image/jpeg' });

describe('analyzeFoodImage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs the file as multipart/form-data and maps the response to camelCase', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        name: 'Banana',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        serving_size: '1 medium',
        disclaimer: 'AI estimate from a photo — not a substitute for a lab measurement.',
      }),
    );

    const result = await analyzeFoodImage(sampleFile);

    expect(fetch).toHaveBeenCalledWith('/api/analyze-food-image', {
      method: 'POST',
      body: expect.any(FormData),
    });
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const formData = init!.body as FormData;
    expect(formData.get('file')).toBe(sampleFile);

    expect(result).toEqual({
      name: 'Banana',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      servingSize: '1 medium',
      disclaimer: 'AI estimate from a photo — not a substitute for a lab measurement.',
    });
  });

  it('throws a PhotoAnalysisError with the backend detail message on failure', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ detail: 'Image too large (8MB max).' }, false, 413));

    await expect(analyzeFoodImage(sampleFile)).rejects.toThrow(PhotoAnalysisError);
    await expect(analyzeFoodImage(sampleFile)).rejects.toThrow('Image too large (8MB max).');
  });

  it('falls back to a generic message when the error response has no detail', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 502, json: () => Promise.reject(new Error('no body')) } as Response);

    await expect(analyzeFoodImage(sampleFile)).rejects.toThrow('Request failed with status 502');
  });
});
