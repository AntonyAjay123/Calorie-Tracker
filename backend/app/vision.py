import base64
import json

from anthropic import Anthropic

from app.config import Settings
from app.schemas import FoodAnalysisResult

SYSTEM_PROMPT = (
    "You are a nutrition estimation assistant. Look at the photo of food and identify the "
    "single most prominent food item — if several are visible, describe only the largest or "
    "most prominent one, not a list. Respond with ONLY a JSON object, no markdown fencing and "
    "no prose before or after it, matching exactly this shape: "
    '{"name": string, "calories": number, "protein": number, "carbs": number, "fat": number, '
    '"servingSize": string}. calories/protein/carbs/fat are your best-guess totals for the '
    "portion shown (protein/carbs/fat in grams); servingSize is your own short estimate of the "
    'portion, e.g. "~1 cup".'
)


class VisionAnalysisError(Exception):
    """Raised when the model's response can't be parsed into a FoodAnalysisResult."""


def analyze_food_image(image_bytes: bytes, media_type: str, settings: Settings) -> FoodAnalysisResult:
    client = Anthropic(api_key=settings.anthropic_api_key)

    response = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": base64.b64encode(image_bytes).decode("ascii"),
                        },
                    },
                    {"type": "text", "text": "Analyze this food photo."},
                ],
            }
        ],
    )

    return _parse_result(_extract_text(response))


def _extract_text(response: object) -> str:
    blocks = getattr(response, "content", [])
    return "".join(block.text for block in blocks if getattr(block, "type", None) == "text")


def _parse_result(text: str) -> FoodAnalysisResult:
    try:
        parsed = json.loads(text)
        return FoodAnalysisResult(
            name=parsed["name"],
            calories=parsed["calories"],
            protein=parsed["protein"],
            carbs=parsed["carbs"],
            fat=parsed["fat"],
            serving_size=parsed["servingSize"],
        )
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise VisionAnalysisError(f"Couldn't parse a food analysis from the model's response: {text!r}") from exc
