# Calorie Tracker — Backend

FastAPI service for the Calorie Tracker's photo-upload calorie analysis and (from Phase 6 onward) daily log storage.

See the repo root's [`CLAUDE.md`](../CLAUDE.md) and [`docs/PLAN.md`](../docs/PLAN.md) for the full architecture, phase breakdown, and how to run this alongside the frontend.

```bash
uv sync
uv run fastapi dev app/main.py --port 8001
uv run pytest
```
