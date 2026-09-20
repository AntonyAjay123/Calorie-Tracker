import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { usePhotoAnalysis } from '../../hooks/usePhotoAnalysis';
import { ALLOWED_CONTENT_TYPES, MAX_IMAGE_BYTES } from '../../lib/photoAnalysis';
import type { Food } from '../../types';
import { PhotoResultCard } from './PhotoResultCard';

interface PhotoUploadPanelProps {
  onAdd: (food: Food, quantity: number, source: 'photo') => void;
}

export function PhotoUploadPanel({ onAdd }: PhotoUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { status, result, error, analyze, reset } = usePhotoAnalysis();

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const resetAll = () => {
    setFile(null);
    setValidationError(null);
    reset();
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    reset();
    setValidationError(null);

    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_CONTENT_TYPES.includes(selected.type)) {
      setValidationError('Unsupported image type. Use JPEG, PNG, or WebP.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setValidationError('Image too large (8MB max).');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleAdd = (food: Food, quantity: number, source: 'photo') => {
    onAdd(food, quantity, source);
    resetAll();
  };

  if (status === 'success' && result) {
    return (
      <div className="mt-4 space-y-3">
        <PhotoResultCard result={result} onAdd={handleAdd} />
        <button
          type="button"
          onClick={resetAll}
          className="text-sm text-ink-muted underline decoration-line underline-offset-2 hover:text-ink"
        >
          Try another photo
        </button>
      </div>
    );
  }

  const message = validationError ?? (status === 'error' ? error : null);

  return (
    <div className="mt-4 border border-line bg-paper p-4">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_CONTENT_TYPES.join(',')}
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Choose a food photo"
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Selected food, ready to analyze"
          className="mb-3 h-48 w-full border border-line object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border border-line px-3 py-1.5 text-sm font-medium text-ink hover:border-ink"
        >
          {file ? 'Choose a different photo' : 'Choose a photo'}
        </button>

        {file && (
          <button
            type="button"
            onClick={() => analyze(file)}
            disabled={status === 'uploading'}
            className="bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'uploading' ? 'Analyzing…' : 'Analyze photo'}
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-ink-muted">JPEG, PNG, or WebP, up to 8MB.</p>

      {message && (
        <p role="status" className="mt-2 text-sm text-protein">
          {message}
        </p>
      )}
    </div>
  );
}
