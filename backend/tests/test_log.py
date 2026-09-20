from fastapi.testclient import TestClient

SAMPLE_ENTRY = {
    "food_id": "chicken-breast",
    "food_name": "Chicken Breast",
    "quantity": 1.5,
    "calories": 247.5,
    "protein": 46.5,
    "carbs": 0.0,
    "fat": 5.4,
    "serving_size": "100g",
    "date": "2026-03-05",
}


def test_list_entries_returns_empty_for_a_date_with_nothing_logged(client: TestClient) -> None:
    response = client.get("/api/log", params={"date": "2026-03-05"})
    assert response.status_code == 200
    assert response.json() == []


def test_create_entry_assigns_id_and_logged_at(client: TestClient) -> None:
    response = client.post("/api/log", json=SAMPLE_ENTRY)
    assert response.status_code == 201

    body = response.json()
    assert body["id"]
    assert body["logged_at"]
    assert body["food_name"] == "Chicken Breast"
    assert body["calories"] == 247.5


def test_created_entry_is_returned_by_list_for_its_date(client: TestClient) -> None:
    client.post("/api/log", json=SAMPLE_ENTRY)

    response = client.get("/api/log", params={"date": "2026-03-05"})
    assert response.status_code == 200
    entries = response.json()
    assert len(entries) == 1
    assert entries[0]["food_name"] == "Chicken Breast"


def test_list_entries_excludes_other_dates(client: TestClient) -> None:
    client.post("/api/log", json=SAMPLE_ENTRY)

    response = client.get("/api/log", params={"date": "2026-03-04"})
    assert response.status_code == 200
    assert response.json() == []


def test_delete_entry_removes_it(client: TestClient) -> None:
    created = client.post("/api/log", json=SAMPLE_ENTRY).json()

    delete_response = client.delete(f"/api/log/{created['id']}")
    assert delete_response.status_code == 204

    list_response = client.get("/api/log", params={"date": "2026-03-05"})
    assert list_response.json() == []


def test_delete_unknown_entry_returns_404(client: TestClient) -> None:
    response = client.delete("/api/log/does-not-exist")
    assert response.status_code == 404


def test_create_entry_defaults_source_to_null(client: TestClient) -> None:
    response = client.post("/api/log", json=SAMPLE_ENTRY)
    assert response.json()["source"] is None


def test_create_entry_accepts_an_explicit_source(client: TestClient) -> None:
    response = client.post("/api/log", json={**SAMPLE_ENTRY, "source": "photo"})
    assert response.json()["source"] == "photo"
