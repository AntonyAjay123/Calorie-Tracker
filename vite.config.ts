import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
// Inside Docker Compose, "localhost" refers to the frontend container itself, not the
// backend container — the backend service sets BACKEND_URL=http://backend:8001 so the
// proxy reaches it over the Compose network. Local (non-Docker) dev leaves this unset and
// falls back to the backend's usual localhost port (see CLAUDE.md's port note for why 8001).
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8001'

// Docker Desktop's bind-mounted filesystem doesn't reliably forward native
// inotify events into the container, so Vite's default watcher can miss host-side
// edits entirely. docker-compose.yml sets DOCKER=true for the frontend service to
// fall back to polling there; local (non-Docker) dev is unaffected.
const inDocker = process.env.DOCKER === 'true'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/api': backendUrl,
    },
    watch: inDocker ? { usePolling: true } : undefined,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
