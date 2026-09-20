import pytest

from app.config import Settings
from app.vision import VisionAnalysisError, _parse_result, analyze_food_image


class FakeTextBlock:
    def __init__(self, text: str) -> None:
        self.type = "text"
        self.text = text


class FakeResponse:
    def __init__(self, text: str) -> None:
        self.content = [FakeTextBlock(text)]


class FakeMessages:
    def __init__(self, response_text: str) -> None:
        self._response_text = response_text
        self.create_kwargs: dict | None = None

    def create(self, **kwargs) -> FakeResponse:
        self.create_kwargs = kwargs
        return FakeResponse(self._response_text)


class FakeAnthropicClient:
    def __init__(self, response_text: str) -> None:
        self.messages = FakeMessages(response_text)


VALID_JSON = (
    '{"name": "Grilled Chicken Breast", "calories": 250, "protein": 45, "carbs": 0, '
    '"fat": 6, "servingSize": "~1 breast"}'
)


def settings() -> Settings:
    return Settings(_env_file=None, anthropic_api_key="test-key")


def test_parse_result_extracts_a_valid_json_response() -> None:
    result = _parse_result(VALID_JSON)
    assert result.name == "Grilled Chicken Breast"
    assert result.calories == 250
    assert result.serving_size == "~1 breast"
    assert result.disclaimer


def test_parse_result_raises_on_malformed_json() -> None:
    with pytest.raises(VisionAnalysisError):
        _parse_result("not json at all")


def test_parse_result_raises_when_a_required_field_is_missing() -> None:
    with pytest.raises(VisionAnalysisError):
        _parse_result('{"name": "Toast", "calories": 100}')


def test_analyze_food_image_calls_the_model_and_returns_a_parsed_result(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_client = FakeAnthropicClient(VALID_JSON)
    monkeypatch.setattr("app.vision.Anthropic", lambda api_key: fake_client)

    result = analyze_food_image(b"fake-image-bytes", "image/jpeg", settings())

    assert result.name == "Grilled Chicken Breast"
    assert fake_client.messages.create_kwargs is not None
    assert fake_client.messages.create_kwargs["model"] == settings().anthropic_model
    image_block = fake_client.messages.create_kwargs["messages"][0]["content"][0]
    assert image_block["source"]["media_type"] == "image/jpeg"


def test_analyze_food_image_raises_vision_analysis_error_on_a_refusal(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_client = FakeAnthropicClient("Sorry, I can't help with that.")
    monkeypatch.setattr("app.vision.Anthropic", lambda api_key: fake_client)

    with pytest.raises(VisionAnalysisError):
        analyze_food_image(b"fake-image-bytes", "image/jpeg", settings())
