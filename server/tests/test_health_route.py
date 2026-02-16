from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_route_returns_ok_and_request_id() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers.get("x-request-id")
