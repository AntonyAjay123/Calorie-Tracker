from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.config import Settings, get_settings
from app.schemas import FoodAnalysisResult
from app.vision import VisionAnalysisError, analyze_food_image

router = APIRouter(prefix="/api", tags=["analyze"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8MB


@router.post("/analyze-food-image", response_model=FoodAnalysisResult)
async def analyze_food_image_endpoint(
    file: UploadFile, settings: Settings = Depends(get_settings)
) -> FoodAnalysisResult:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported image type. Use JPEG, PNG, or WebP.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (8MB max).")

    try:
        return analyze_food_image(image_bytes, file.content_type, settings)
    except VisionAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
