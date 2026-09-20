import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PhotoAnalysisError } from '../lib/photoAnalysis';
import type { PhotoAnalysisResult } from '../types';
import { usePhotoAnalysis } from './usePhotoAnalysis';

const { analyzeFoodImage } = vi.hoisted(() => ({ analyzeFoodImage: vi.fn() }));
vi.mock('../lib/photoAnalysis', async () => {
  const actual = await vi.importActual<typeof import('../lib/photoAnalysis')>('../lib/photoAnalysis');
  return { ...actual, analyzeFoodImage };
});

const sampleResult: PhotoAnalysisResult = {
  name: 'Banana',
  calories: 105,
  protein: 1.3,
  carbs: 27,
  fat: 0.4,
  servingSize: '1 medium',
  disclaimer: 'AI estimate.',
};

const sampleFile = new File(['fake-bytes'], 'plate.jpg', { type: 'image/jpeg' });

describe('usePhotoAnalysis', () => {
  beforeEach(() => {
    analyzeFoodImage.mockReset();
  });

  it('starts idle with no result or error', () => {
    const { result } = renderHook(() => usePhotoAnalysis());
    expect(result.current.status).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('moves to uploading then success, storing the result', async () => {
    analyzeFoodImage.mockResolvedValue(sampleResult);
    const { result } = renderHook(() => usePhotoAnalysis());

    act(() => {
      void result.current.analyze(sampleFile);
    });
    expect(result.current.status).toBe('uploading');

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.result).toEqual(sampleResult);
    expect(result.current.error).toBeNull();
  });

  it('moves to error and stores the message when analysis fails with a PhotoAnalysisError', async () => {
    analyzeFoodImage.mockRejectedValue(new PhotoAnalysisError('Unsupported image type. Use JPEG, PNG, or WebP.'));
    const { result } = renderHook(() => usePhotoAnalysis());

    await act(async () => {
      await result.current.analyze(sampleFile);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Unsupported image type. Use JPEG, PNG, or WebP.');
    expect(result.current.result).toBeNull();
  });

  it('falls back to a generic message for a non-PhotoAnalysisError failure', async () => {
    analyzeFoodImage.mockRejectedValue(new TypeError('network error'));
    const { result } = renderHook(() => usePhotoAnalysis());

    await act(async () => {
      await result.current.analyze(sampleFile);
    });

    expect(result.current.error).toMatch(/couldn't analyze that photo/i);
  });

  it('reset clears status, result, and error back to idle', async () => {
    analyzeFoodImage.mockResolvedValue(sampleResult);
    const { result } = renderHook(() => usePhotoAnalysis());

    await act(async () => {
      await result.current.analyze(sampleFile);
    });
    expect(result.current.status).toBe('success');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
