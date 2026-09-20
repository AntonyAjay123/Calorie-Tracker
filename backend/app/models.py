import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class LogEntry(SQLModel, table=True):
    """A single logged food item. Doubles as the DB table and the API's response schema.

    Field names are snake_case (idiomatic Python/JSON); the frontend's `storage.ts` is the
    boundary that translates to/from the camelCase `LogEntry` TypeScript type.
    """

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    food_id: str
    food_name: str
    quantity: float
    calories: float
    protein: float
    carbs: float
    fat: float
    serving_size: str
    date: str
    logged_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: str | None = None


class LogEntryCreate(SQLModel):
    """Request body for POST /api/log — everything except the server-assigned id/logged_at."""

    food_id: str
    food_name: str
    quantity: float
    calories: float
    protein: float
    carbs: float
    fat: float
    serving_size: str
    date: str
    source: str | None = None
