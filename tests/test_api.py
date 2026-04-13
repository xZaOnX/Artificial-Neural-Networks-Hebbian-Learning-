"""
tests/test_api.py — smoke tests for the Vercel Python API helpers.
"""

import pytest

from patterns import GRID_SIZE
from vercel_api import N_NEURONS, get_gallery_payload, run_recall


def test_gallery_payload_contains_expected_metadata():
    payload = get_gallery_payload("tr")

    assert payload["lang"] == "tr"
    assert payload["gridSize"] == GRID_SIZE
    assert payload["patternNames"]
    assert payload["galleryImage"].startswith("data:image/png;base64,")


def test_stored_recall_returns_metrics_and_images():
    payload = run_recall(
        {
            "lang": "en",
            "input_mode": "stored",
            "pattern": "A",
            "noise_level": 0.1,
            "mask_ratio": 0.05,
            "update_mode": "synchronous",
            "steps": 8,
            "threshold": 0.0,
            "seed": 11,
        }
    )

    assert payload["inputMode"] == "stored"
    assert payload["metrics"]["totalBits"] == N_NEURONS
    assert payload["images"]["comparison"].startswith("data:image/png;base64,")
    assert payload["images"]["trajectory"].startswith("data:image/png;base64,")
    assert payload["images"]["overlap"].startswith("data:image/png;base64,")


def test_custom_recall_returns_neutral_badge():
    custom_pattern = [1 if idx % GRID_SIZE == 0 else -1 for idx in range(N_NEURONS)]
    payload = run_recall(
        {
            "lang": "en",
            "input_mode": "custom",
            "custom_pattern": custom_pattern,
            "noise_level": 0.0,
            "mask_ratio": 0.0,
            "update_mode": "asynchronous",
            "steps": 5,
            "threshold": 0.0,
            "seed": 7,
        }
    )

    assert payload["inputMode"] == "custom"
    assert payload["badge"]["variant"] == "neutral"
    assert payload["badge"]["text"].startswith("→ ")


def test_custom_recall_rejects_invalid_pattern_length():
    with pytest.raises(ValueError):
        run_recall({"input_mode": "custom", "custom_pattern": [1, -1]})
