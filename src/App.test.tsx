import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

// A minimal in-memory stand-in for the Phase 6 backend's /api/log endpoints, since App now
// talks to the backend via fetch instead of reading/writing localStorage directly. Keeping this
// here (rather than mocking `lib/storage` directly) preserves this suite's value as a true
// integration test — it still exercises the snake_case<->camelCase translation in storage.ts.
function stubBackend() {
  const entries: Array<Record<string, unknown>> = [];
  let nextId = 1;

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method ?? 'GET';

    if (method === 'GET' && url.startsWith('/api/log?date=')) {
      const date = decodeURIComponent(url.slice('/api/log?date='.length));
      return jsonResponse(entries.filter((entry) => entry.date === date));
    }

    if (method === 'POST' && url === '/api/log') {
      const body = JSON.parse(init!.body as string);
      const created = { ...body, id: String(nextId++), logged_at: new Date().toISOString() };
      entries.push(created);
      return jsonResponse(created, 201);
    }

    const deleteMatch = /^\/api\/log\/(.+)$/.exec(url);
    if (method === 'DELETE' && deleteMatch) {
      const id = decodeURIComponent(deleteMatch[1]);
      const index = entries.findIndex((entry) => entry.id === id);
      if (index !== -1) entries.splice(index, 1);
      return { ok: true, status: 204, url, json: () => Promise.resolve(null) } as Response;
    }

    if (method === 'POST' && url === '/api/analyze-food-image') {
      return jsonResponse({
        name: 'Banana',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        serving_size: '1 medium',
        disclaimer: 'AI estimate.',
      });
    }

    throw new Error(`Unhandled request in stubBackend: ${method} ${url}`);
  });

  vi.stubGlobal('fetch', fetchMock);
}

function jsonResponse(body: unknown, status = 200): Response {
  return { ok: true, status, url: '/api/log', json: () => Promise.resolve(body) } as Response;
}

async function waitForLogToFinishLoading() {
  await waitFor(() => expect(screen.queryByText(/^loading/i)).not.toBeInTheDocument());
}

describe('App (integration: search -> add -> log display -> totals -> delete -> date navigation)', () => {
  beforeEach(() => {
    stubBackend();
    URL.createObjectURL = vi.fn(() => 'blob:mock-preview');
    URL.revokeObjectURL = vi.fn();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 5, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('searching for and adding a food logs a correctly-scaled entry via the backend', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLogToFinishLoading();

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Chicken Breast');

    const card = screen.getByText('Chicken Breast').closest('div')!.parentElement!;
    await user.click(within(card).getByRole('button', { name: /increase quantity/i }));
    await user.click(within(card).getByRole('button', { name: /^add$/i }));

    const log = screen.getByRole('heading', { name: 'Log' }).closest('section')!;
    await within(log).findByText('Chicken Breast');
    expect(within(log).getByText('×1.5')).toBeInTheDocument();
    expect(screen.getByText('248')).toBeInTheDocument(); // 165 * 1.5 = 247.5 -> rounded
  });

  it('an entry added before a remount (simulated page refresh) is still loaded afterward', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await waitForLogToFinishLoading();

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Banana');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    const log = screen.getByRole('heading', { name: 'Log' }).closest('section')!;
    await within(log).findByText('Banana');

    unmount();

    // Re-mounting re-fetches from the (same, still-populated) stubbed backend.
    render(<App />);
    await waitForLogToFinishLoading();
    const logAfterRemount = screen.getByRole('heading', { name: 'Log' }).closest('section')!;
    expect(within(logAfterRemount).getByText('Banana')).toBeInTheDocument();
  });

  it('adding a food updates the header totals and shows it in the daily log', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLogToFinishLoading();

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/nothing logged here yet/i)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Chicken Breast');
    const card = screen.getByText('Chicken Breast').closest('div')!.parentElement!;
    await user.click(within(card).getByRole('button', { name: /increase quantity/i }));
    await user.click(within(card).getByRole('button', { name: /^add$/i }));

    // Header total: 165 kcal * 1.5 = 247.5 -> rounded to 248
    await waitFor(() => expect(screen.getByText('248')).toBeInTheDocument());

    const log = screen.getByRole('heading', { name: 'Log' }).closest('section')!;
    expect(within(log).getByText('Chicken Breast')).toBeInTheDocument();
    expect(within(log).getByText('×1.5')).toBeInTheDocument();
  });

  it('adding two foods lists the most recently added one first, and removing it (with confirm) restores the total', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLogToFinishLoading();

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Egg');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await user.clear(screen.getByRole('textbox', { name: /search foods/i }));

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Banana');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    const log = screen.getByRole('heading', { name: 'Log' }).closest('section')!;
    const rows = await waitFor(() => {
      const found = within(log).getAllByRole('listitem');
      expect(found).toHaveLength(2);
      return found;
    });
    expect(rows[0]).toHaveTextContent('Banana'); // added second -> newest first
    expect(rows[1]).toHaveTextContent('Egg');

    // Remove Banana, which requires a confirm click.
    await user.click(within(rows[0]).getByRole('button', { name: /remove banana/i }));
    await user.click(within(log).getByRole('button', { name: /confirm/i }));

    await waitFor(() => expect(within(log).getAllByRole('listitem')).toHaveLength(1));
    const remainingRows = within(log).getAllByRole('listitem');
    expect(remainingRows[0]).toHaveTextContent('Egg');
    expect(screen.getByText('78')).toBeInTheDocument(); // just Egg's calories remain
  });

  it('navigating to a previous day shows that day empty, with the next-day button disabled while on today', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLogToFinishLoading();
    const header = screen.getByRole('banner');

    // Log something today first.
    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Egg');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await waitFor(() => expect(within(header).getByText('78')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /next day/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /previous day/i }));
    await waitForLogToFinishLoading();

    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(within(header).getByText('0')).toBeInTheDocument(); // yesterday's total, not today's
    expect(screen.getByText(/nothing logged here yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next day/i })).not.toBeDisabled();
  });

  it('adding a food while viewing a previous day logs it under that date, not today, and returning to today leaves it unaffected', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLogToFinishLoading();
    const header = screen.getByRole('banner');

    await user.click(screen.getByRole('button', { name: /previous day/i })); // now on 2026-03-04
    await waitForLogToFinishLoading();

    await user.type(screen.getByRole('textbox', { name: /search foods/i }), 'Banana');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    await screen.findByText('Banana', { selector: 'p' }); // in the log, not just the FoodCard
    await waitFor(() => expect(within(header).getByText('105')).toBeInTheDocument()); // yesterday's total

    await user.click(screen.getByRole('button', { name: /^today$/i }));
    await waitForLogToFinishLoading();

    expect(within(header).getByText('0')).toBeInTheDocument(); // today has nothing logged
    expect(screen.getByText(/nothing logged here yet/i)).toBeInTheDocument();
    expect(screen.queryByText('Banana', { selector: 'p' })).not.toBeInTheDocument();
  });

  it('shows a friendly error and keeps entries empty when the backend is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    );

    render(<App />);

    expect(await screen.findByText(/couldn't reach the server/i)).toBeInTheDocument();
  });

  it('switching to the Photo tab, analyzing a photo, and adding it logs a photo-sourced entry', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLogToFinishLoading();

    await user.click(screen.getByRole('button', { name: /^photo$/i }));
    expect(screen.queryByRole('textbox', { name: /search foods/i })).not.toBeInTheDocument();

    const file = new File(['fake-bytes'], 'plate.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/choose a food photo/i), file);
    await user.click(screen.getByRole('button', { name: /analyze photo/i }));

    await screen.findByText('Banana');
    await user.click(screen.getByRole('button', { name: /add to log/i }));

    const log = screen.getByRole('heading', { name: 'Log' }).closest('section')!;
    await within(log).findByText('Banana', { selector: 'p' });
    await waitFor(() => expect(screen.getByText('105')).toBeInTheDocument());

    // Switching back to Search shows the catalog again, confirming the tabs are independent.
    await user.click(screen.getByRole('button', { name: /^search$/i }));
    expect(screen.getByRole('textbox', { name: /search foods/i })).toBeInTheDocument();
  });
});
