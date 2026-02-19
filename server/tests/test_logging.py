import json
import logging

from app.core.logging import JsonFormatter


def test_json_formatter_includes_allowlisted_fields_only() -> None:
    record = logging.LogRecord(
        name="app.test",
        level=logging.INFO,
        pathname=__file__,
        lineno=10,
        msg="request_complete",
        args=(),
        exc_info=None,
    )
    record.event = "request_complete"
    record.request_id = "req-123"
    record.method = "GET"
    record.path = "/api/health"
    record.status = 200
    record.duration_ms = 12.5
    record.api_key = "should-not-appear"

    payload = json.loads(JsonFormatter().format(record))

    assert payload["message"] == "request_complete"
    assert payload["event"] == "request_complete"
    assert payload["request_id"] == "req-123"
    assert payload["method"] == "GET"
    assert payload["path"] == "/api/health"
    assert payload["status"] == 200
    assert payload["duration_ms"] == 12.5
    assert "api_key" not in payload
