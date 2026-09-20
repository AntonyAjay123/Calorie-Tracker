import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_IMAGE_BYTES } from '../../lib/photoAnalysis';
import { PhotoUploadPanel } from './PhotoUploadPanel';

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 500): Response {
  return { ok, status, json: () => Promise.resolve(body) } as Response;
}

const validFile = new File(['fake-bytes'], 'plate.jpg', { type: 'image/jpeg' });
const oversizedFile = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'huge.jpg', { type: 'image/jpeg' });
const wrongTypeFile = new File(['not an image'], 'notes.txt', { type: 'text/plain' });

// userEvent.upload enforces the input's `accept` attribute the way a native file picker would,
// so it can't be used to select a file of a type the input doesn't declare — it silently no-ops.
// The component's own content-type check is defense-in-depth (e.g. a picker that allowed "all
// files"), so this bypasses that native-picker emulation to reach it directly.
function selectFileBypassingAccept(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
}

const analysisDto = {
  name: 'Banana',
  calories: 105,
  protein: 1.3,
  carbs: 27,
  fat: 0.4,
  serving_size: '1 medium',
  disclaimer: 'AI estimate.',
};

describe('PhotoUploadPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    URL.createObjectURL = vi.fn(() => 'blob:mock-preview');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the idle choose-a-photo state with no Analyze button', () => {
    render(<PhotoUploadPanel onAdd={() => {}} />);
    expect(screen.getByRole('button', { name: /choose a photo/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /analyze photo/i })).not.toBeInTheDocument();
  });

  it('selecting a valid photo shows a preview and the Analyze action', async () => {
    const user = userEvent.setup();
    render(<PhotoUploadPanel onAdd={() => {}} />);

    await user.upload(screen.getByLabelText(/choose a food photo/i), validFile);

    expect(screen.getByRole('img', { name: /ready to analyze/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze photo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /choose a different photo/i })).toBeInTheDocument();
  });

  it('rejects an unsupported file type client-side, without calling the backend', async () => {
    render(<PhotoUploadPanel onAdd={() => {}} />);

    selectFileBypassingAccept(screen.getByLabelText(/choose a food photo/i), wrongTypeFile);

    expect(screen.getByText(/unsupported image type/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /analyze photo/i })).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects an oversized file client-side, without calling the backend', async () => {
    const user = userEvent.setup();
    render(<PhotoUploadPanel onAdd={() => {}} />);

    await user.upload(screen.getByLabelText(/choose a food photo/i), oversizedFile);

    expect(screen.getByText(/image too large/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('analyzing a photo shows the result card, and adding it calls onAdd and resets to idle', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(analysisDto));
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<PhotoUploadPanel onAdd={onAdd} />);

    await user.upload(screen.getByLabelText(/choose a food photo/i), validFile);
    await user.click(screen.getByRole('button', { name: /analyze photo/i }));

    await screen.findByText('Banana');
    await user.click(screen.getByRole('button', { name: /add to log/i }));

    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ name: 'Banana' }), 1, 'photo');
    await waitFor(() => expect(screen.getByRole('button', { name: /choose a photo/i })).toBeInTheDocument());
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('shows the backend error message when analysis fails, and lets the user retry', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ detail: 'Unsupported image type. Use JPEG, PNG, or WebP.' }, false, 415));
    const user = userEvent.setup();
    render(<PhotoUploadPanel onAdd={() => {}} />);

    await user.upload(screen.getByLabelText(/choose a food photo/i), validFile);
    await user.click(screen.getByRole('button', { name: /analyze photo/i }));

    expect(await screen.findByText('Unsupported image type. Use JPEG, PNG, or WebP.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze photo/i })).toBeInTheDocument();
  });

  it('choosing a different photo clears a previous analysis error', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ detail: 'boom' }, false, 502));
    const user = userEvent.setup();
    render(<PhotoUploadPanel onAdd={() => {}} />);

    await user.upload(screen.getByLabelText(/choose a food photo/i), validFile);
    await user.click(screen.getByRole('button', { name: /analyze photo/i }));
    await screen.findByText('boom');

    const anotherFile = new File(['other-bytes'], 'plate2.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/choose a food photo/i), anotherFile);
    expect(screen.queryByText('boom')).not.toBeInTheDocument();
  });
});
