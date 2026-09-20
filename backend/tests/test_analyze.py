import io

import pytest
from fastapi.testclient import TestClient

from app.schemas import FoodAnalysisResult
from app.vision import VisionAnalysisError

TINY_JPEG = b"\xff\xd8\xff\xe0fake-jpeg-bytes"


def test_analyze_rejects_an_unsupported_content_type(client: TestClient) -> None:
    response = client.post(
        "/api/analyze-food-image",
        files={"file": ("plate.gif", io.BytesIO(TINY_JPEG), "image/gif")},
    )
    assert response.status_code == 415


def test_analyze_rejects_an_image_over_the_size_limit(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("app.routers.analyze.MAX_IMAGE_BYTES", 10)
    response = client.post(
        "/api/analyze-food-image",
        files={"file": ("plate.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")},
    )
    assert response.status_code == 413


def test_analyze_returns_the_parsed_result_on_success(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    canned_result = FoodAnalysisResult(
        name="Banana", calories=105, protein=1.3, carbs=27, fat=0.4, serving_size="1 medium"
    )
    monkeypatch.setattr("app.routers.analyze.analyze_food_image", lambda *args, **kwargs: canned_result)

    response = client.post(
        "/api/analyze-food-image",
        files={"file": ("plate.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Banana"
    assert body["calories"] == 105


def test_analyze_returns_a_502_when_the_model_response_cant_be_parsed(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def raise_vision_error(*args: object, **kwargs: object) -> None:
        raise VisionAnalysisError("model refused")

    monkeypatch.setattr("app.routers.analyze.analyze_food_image", raise_vision_error)

    response = client.post(
        "/api/analyze-food-image",
        files={"file": ("plate.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")},
    )

    assert response.status_code == 502
