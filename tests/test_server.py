"""
tests/test_server.py — smoke tests for the Vercel Flask entrypoint.
"""

from server import app


def test_index_renders():
    client = app.test_client()
    response = client.get("/")

    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert "Hebbian Pattern Recall" in body
    assert "Stored Patterns" in body


def test_recall_submission_renders_metrics():
    client = app.test_client()
    response = client.get(
        "/?run=1&pattern=A&noise_level=0.10&mask_ratio=0.05"
        "&update_mode=synchronous&steps=8&threshold=0.0&seed=11"
    )

    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert "Recall Result" in body
    assert "Accuracy" in body
    assert "data:image/png;base64" in body
