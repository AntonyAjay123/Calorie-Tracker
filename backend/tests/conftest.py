from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture() -> Generator[Session, None, None]:
    # A fresh in-memory DB per test; StaticPool keeps the same connection alive across the
    # session (an in-memory SQLite DB otherwise disappears once its one connection closes).
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    def get_session_override() -> Session:
        return session

    app.dependency_overrides[get_session] = get_session_override
    # Not entered as a context manager: that would run the app's lifespan (creating the real
    # backend/data/ SQLite file on disk), which isn't needed here since get_session is overridden
    # to use the in-memory `session` fixture for every request.
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
