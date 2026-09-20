# Dev-oriented image: source is bind-mounted in by docker-compose.yml, so this build
# only needs to produce a working virtualenv. `uv run fastapi dev --reload` (the default
# for `fastapi dev`) then picks up live edits from the host.
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app

# Install dependencies in their own layer so `uv sync` is only re-run when these change,
# not on every source edit.
COPY pyproject.toml uv.lock ./
RUN uv sync --locked

COPY . .

EXPOSE 8001

CMD ["uv", "run", "fastapi", "dev", "app/main.py", "--host", "0.0.0.0", "--port", "8001"]
