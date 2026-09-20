import { useCallback, useState } from 'react';
import { analyzeFoodImage, PhotoAnalysisError } from '../lib/photoAnalysis';
import type { PhotoAnalysisResult } from '../types';

type Status = 'idle' | 'uploading' | 'success' | 'error';

const FALLBACK_ERROR_MESSAGE = "Couldn't analyze that photo. Is the backend running?";

export function usePhotoAnalysis() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (file: File) => {
    setStatus('uploading');
    setError(null);
    try {
      setResult(await analyzeFoodImage(file));
      setStatus('success');
    } catch (err) {
      setError(err instanceof PhotoAnalysisError ? err.message : FALLBACK_ERROR_MESSAGE);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, analyze, reset };
}
