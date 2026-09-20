import pytest
from pydantic import ValidationError

from app.config import Settings


def test_settings_requires_anthropic_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    """Fails fast at startup if the key is missing, rather than failing on first upload."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_settings_loads_the_api_key_from_the_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    settings = Settings(_env_file=None)
    assert settings.anthropic_api_key == "test-key"


def test_settings_defaults_the_model(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    settings = Settings(_env_file=None)
    assert settings.anthropic_model == "claude-sonnet-5"


def test_settings_allows_overriding_the_model(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.setenv("ANTHROPIC_MODEL", "claude-opus-5")
    settings = Settings(_env_file=None)
    assert settings.anthropic_model == "claude-opus-5"
