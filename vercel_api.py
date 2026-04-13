from __future__ import annotations

import base64
import io
import os
from functools import lru_cache
from typing import Any

os.environ.setdefault("XDG_CACHE_HOME", "/tmp")
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")
os.makedirs(os.environ["MPLCONFIGDIR"], exist_ok=True)

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np

from hebbian import (
    build_weight_matrix,
    count_errors,
    find_nearest_pattern,
    overlap,
    recall_asynchronous,
    recall_synchronous,
)
from noise import corrupt
from patterns import GRID_SIZE, get_all_patterns, get_pattern_matrix
from translations import t
from utils import accuracy, energy
from visualization import (
    plot_all_stored_patterns,
    plot_comparison,
    plot_overlap_bars,
    plot_recall_history,
)

ALL_PATTERNS = get_all_patterns()
PATTERN_MATRIX, PATTERN_NAMES = get_pattern_matrix()
WEIGHT_MATRIX = build_weight_matrix(PATTERN_MATRIX, zero_diagonal=True)
N_NEURONS = GRID_SIZE * GRID_SIZE
DEFAULT_PATTERN = PATTERN_NAMES[0]
DEFAULT_INPUT_MODE = "stored"
DEFAULT_UPDATE_MODE = "synchronous"


def _figure_to_data_uri(fig) -> str:
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight", dpi=160, transparent=True)
    buffer.seek(0)
    payload = base64.b64encode(buffer.read()).decode("ascii")
    plt.close(fig)
    return f"data:image/png;base64,{payload}"


def _clamp_float(value: Any, default: float, minimum: float, maximum: float) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return min(max(parsed, minimum), maximum)


def _clamp_int(
    value: Any,
    default: int,
    minimum: int | None = None,
    maximum: int | None = None,
) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default

    if minimum is not None and parsed < minimum:
        return minimum
    if maximum is not None and parsed > maximum:
        return maximum
    return parsed


def _normalize_lang(value: Any) -> str:
    return value if value in {"en", "tr"} else "en"


def _normalize_input_mode(value: Any) -> str:
    return value if value in {"stored", "custom"} else DEFAULT_INPUT_MODE


def _normalize_update_mode(value: Any) -> str:
    return value if value in {"synchronous", "asynchronous"} else DEFAULT_UPDATE_MODE


def _normalize_custom_pattern(custom_pattern: Any) -> np.ndarray:
    if not isinstance(custom_pattern, list):
        raise ValueError("custom_pattern must be provided for custom mode.")

    flattened: list[Any] = []
    for value in custom_pattern:
        if isinstance(value, list):
            flattened.extend(value)
        else:
            flattened.append(value)

    if len(flattened) != N_NEURONS:
        raise ValueError(f"custom_pattern must contain exactly {N_NEURONS} cells.")

    normalized: list[float] = []
    for value in flattened:
        if isinstance(value, bool):
            normalized.append(1.0 if value else -1.0)
            continue

        try:
            numeric = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError("custom_pattern must contain boolean or numeric cells.") from exc

        normalized.append(1.0 if numeric > 0 else -1.0)

    return np.array(normalized, dtype=np.float64)


def get_gallery_payload(lang: str = "en") -> dict[str, Any]:
    normalized_lang = _normalize_lang(lang)
    return {
        "lang": normalized_lang,
        "gridSize": GRID_SIZE,
        "defaultPattern": DEFAULT_PATTERN,
        "patternNames": PATTERN_NAMES,
        "patternCount": len(PATTERN_NAMES),
        "galleryCaption": t(
            "pattern_count",
            normalized_lang,
            n=len(PATTERN_NAMES),
            neurons=N_NEURONS,
            cap=int(0.14 * N_NEURONS),
        ),
        "galleryImage": _cached_gallery_image(normalized_lang),
    }


@lru_cache(maxsize=2)
def _cached_gallery_image(lang: str) -> str:
    figure = plot_all_stored_patterns(ALL_PATTERNS, lang=lang)
    return _figure_to_data_uri(figure)


def run_recall(payload: dict[str, Any] | None) -> dict[str, Any]:
    data = payload or {}
    lang = _normalize_lang(data.get("lang", "en"))
    input_mode = _normalize_input_mode(data.get("input_mode", DEFAULT_INPUT_MODE))
    update_mode = _normalize_update_mode(data.get("update_mode", DEFAULT_UPDATE_MODE))
    pattern_name = data.get("pattern", DEFAULT_PATTERN)
    if pattern_name not in ALL_PATTERNS:
        pattern_name = DEFAULT_PATTERN

    noise_level = _clamp_float(data.get("noise_level"), 0.15, 0.0, 1.0)
    mask_ratio = _clamp_float(data.get("mask_ratio"), 0.0, 0.0, 1.0)
    steps = _clamp_int(data.get("steps"), 10, minimum=1, maximum=50)
    threshold = _clamp_float(data.get("threshold"), 0.0, 0.0, 1.0)
    seed = _clamp_int(data.get("seed"), 42)

    if input_mode == "custom":
        original = _normalize_custom_pattern(data.get("custom_pattern"))
        selected_name = "Custom"
    else:
        original = ALL_PATTERNS[pattern_name]
        selected_name = pattern_name

    rng = np.random.default_rng(seed)
    corrupted = corrupt(original, noise_level, mask_ratio, rng)

    if update_mode == "synchronous":
        recalled, history = recall_synchronous(WEIGHT_MATRIX, corrupted, steps, threshold)
    else:
        recalled, history = recall_asynchronous(
            WEIGHT_MATRIX,
            corrupted,
            steps,
            threshold,
            rng,
        )

    nearest_name, _ = find_nearest_pattern(recalled, PATTERN_MATRIX, PATTERN_NAMES)
    is_correct = input_mode == "stored" and nearest_name == pattern_name

    if input_mode == "stored":
        badge_variant = "success" if is_correct else "failure"
        badge_text = t("success", lang) if is_correct else t("failure", lang)
    else:
        badge_variant = "neutral"
        badge_text = f"→ {nearest_name}"

    overlaps = {
        name: round(overlap(recalled, ALL_PATTERNS[name]), 4)
        for name in PATTERN_NAMES
    }

    comparison_image = _figure_to_data_uri(
        plot_comparison(original, corrupted, recalled, selected_name, lang=lang)
    )
    trajectory_image = _figure_to_data_uri(
        plot_recall_history(history, lang=lang)
    )
    overlap_image = _figure_to_data_uri(
        plot_overlap_bars(overlaps, highlight=nearest_name, lang=lang)
    )

    accuracy_value = accuracy(original, recalled)
    error_count = count_errors(original, recalled)
    overlap_value = overlap(original, recalled)
    energy_value = energy(WEIGHT_MATRIX, recalled)

    return {
        "lang": lang,
        "inputMode": input_mode,
        "selectedPattern": selected_name,
        "updateMode": update_mode,
        "badge": {
            "variant": badge_variant,
            "text": badge_text,
        },
        "isCorrect": is_correct if input_mode == "stored" else None,
        "metrics": {
            "accuracy": accuracy_value,
            "accuracyLabel": f"{accuracy_value:.1%}",
            "errors": error_count,
            "errorsLabel": f"{error_count} / {N_NEURONS}",
            "totalBits": N_NEURONS,
            "overlap": overlap_value,
            "overlapLabel": f"{overlap_value:.3f}",
            "nearest": nearest_name,
        },
        "summary": {
            "convergedSteps": len(history) - 1,
            "energy": energy_value,
        },
        "infoLine": " • ".join(
            [
                t("converged_label", lang, steps=len(history) - 1),
                t("energy_label", lang, energy=energy_value),
            ]
        ),
        "images": {
            "comparison": comparison_image,
            "trajectory": trajectory_image,
            "overlap": overlap_image,
        },
    }
