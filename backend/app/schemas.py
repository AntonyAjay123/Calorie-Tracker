from pydantic import BaseModel


class FoodAnalysisResult(BaseModel):
    """Returned by POST /api/analyze-food-image. Not persisted as-is — the frontend wraps it
    into a synthetic Food and adds it via the normal POST /api/log flow."""

    name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    serving_size: str
    disclaimer: str = "AI estimate from a photo — not a substitute for a lab measurement."
