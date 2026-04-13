"""
Flask entrypoint for Vercel deployment.

The original Streamlit interface remains in app.py for local usage.
Vercel serves this Flask app because it supports WSGI-style Python apps.
"""

from __future__ import annotations  # enables X | Y union syntax on Python 3.9

import base64
import io
import os
from dataclasses import dataclass
from functools import lru_cache

os.environ.setdefault("XDG_CACHE_HOME", "/tmp")
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")
os.makedirs(os.environ["MPLCONFIGDIR"], exist_ok=True)

import matplotlib

matplotlib.use("Agg")

import numpy as np
from flask import Flask, render_template, request

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

app = Flask(__name__)

ALL_PATTERNS = get_all_patterns()
PATTERN_MATRIX, PATTERN_NAMES = get_pattern_matrix()
WEIGHT_MATRIX = build_weight_matrix(PATTERN_MATRIX, zero_diagonal=True)
N_NEURONS = GRID_SIZE * GRID_SIZE
DEFAULT_PATTERN = PATTERN_NAMES[0]


@dataclass(frozen=True)
class FormState:
    lang: str
    pattern: str
    noise_level: float
    mask_ratio: float
    update_mode: str
    steps: int
    threshold: float
    seed: int
    run: bool


def _figure_to_data_uri(fig) -> str:
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight", dpi=160, transparent=True)
    buffer.seek(0)
    payload = base64.b64encode(buffer.read()).decode("ascii")
    matplotlib.pyplot.close(fig)
    return f"data:image/png;base64,{payload}"


def _sanitize_text(message: str) -> str:
    return message.replace("**", "").replace("\n", " ").strip()


def _parse_float_arg(
    name: str,
    default: float,
    minimum: float,
    maximum: float,
) -> tuple[float, bool]:
    raw_value = request.args.get(name)
    if raw_value in (None, ""):
        return default, False
    try:
        parsed = float(raw_value)
    except ValueError:
        return default, True
    if parsed < minimum or parsed > maximum:
        return min(max(parsed, minimum), maximum), True
    return parsed, False


def _parse_int_arg(
    name: str,
    default: int,
    minimum: int | None = None,
    maximum: int | None = None,
) -> tuple[int, bool]:
    raw_value = request.args.get(name)
    if raw_value in (None, ""):
        return default, False
    try:
        parsed = int(raw_value)
    except ValueError:
        return default, True
    if minimum is not None and parsed < minimum:
        return minimum, True
    if maximum is not None and parsed > maximum:
        return maximum, True
    return parsed, False


def _build_form_state() -> tuple[FormState, set[str]]:
    invalid_fields: set[str] = set()

    lang = request.args.get("lang", "en")
    if lang not in {"en", "tr"}:
        lang = "en"
        invalid_fields.add("lang")

    pattern = request.args.get("pattern", DEFAULT_PATTERN)
    if pattern not in ALL_PATTERNS:
        pattern = DEFAULT_PATTERN
        invalid_fields.add("pattern")

    noise_level, is_invalid = _parse_float_arg("noise_level", 0.15, 0.0, 1.0)
    if is_invalid:
        invalid_fields.add("noise_level")

    mask_ratio, is_invalid = _parse_float_arg("mask_ratio", 0.0, 0.0, 1.0)
    if is_invalid:
        invalid_fields.add("mask_ratio")

    update_mode = request.args.get("update_mode", "synchronous")
    if update_mode not in {"synchronous", "asynchronous"}:
        update_mode = "synchronous"
        invalid_fields.add("update_mode")

    steps, is_invalid = _parse_int_arg("steps", 12, minimum=1, maximum=30)
    if is_invalid:
        invalid_fields.add("steps")

    threshold, is_invalid = _parse_float_arg("threshold", 0.0, 0.0, 1.0)
    if is_invalid:
        invalid_fields.add("threshold")

    seed, is_invalid = _parse_int_arg("seed", 7)
    if is_invalid:
        invalid_fields.add("seed")

    run = request.args.get("run") == "1"

    return (
        FormState(
            lang=lang,
            pattern=pattern,
            noise_level=noise_level,
            mask_ratio=mask_ratio,
            update_mode=update_mode,
            steps=steps,
            threshold=threshold,
            seed=seed,
            run=run,
        ),
        invalid_fields,
    )


@lru_cache(maxsize=2)
def _gallery_image(lang: str) -> str:
    figure = plot_all_stored_patterns(ALL_PATTERNS, lang=lang)
    return _figure_to_data_uri(figure)


def _run_recall(form: FormState) -> dict:
    rng = np.random.default_rng(form.seed)
    original = ALL_PATTERNS[form.pattern]
    corrupted = corrupt(original, form.noise_level, form.mask_ratio, rng)

    if form.update_mode == "synchronous":
        recalled, history = recall_synchronous(
            WEIGHT_MATRIX,
            corrupted,
            form.steps,
            form.threshold,
        )
    else:
        recalled, history = recall_asynchronous(
            WEIGHT_MATRIX,
            corrupted,
            form.steps,
            form.threshold,
            rng,
        )

    nearest_name, _ = find_nearest_pattern(recalled, PATTERN_MATRIX, PATTERN_NAMES)
    is_correct = nearest_name == form.pattern
    overlaps = {
        name: float(PATTERN_MATRIX[:, idx] @ recalled / len(recalled))
        for idx, name in enumerate(PATTERN_NAMES)
    }

    comparison_image = _figure_to_data_uri(
        plot_comparison(original, corrupted, recalled, form.pattern, lang=form.lang)
    )
    trajectory_image = _figure_to_data_uri(
        plot_recall_history(history, lang=form.lang)
    )
    overlap_image = _figure_to_data_uri(
        plot_overlap_bars(overlaps, highlight=form.pattern, lang=form.lang)
    )

    return {
        "badge_class": "success" if is_correct else "failure",
        "badge_text": t("success", form.lang) if is_correct else t("failure", form.lang),
        "accuracy": f"{accuracy(original, recalled):.1%}",
        "errors": f"{count_errors(original, recalled)} / {N_NEURONS}",
        "overlap": f"{overlap(original, recalled):.3f}",
        "nearest": nearest_name,
        "info_line": " • ".join(
            [
                t("converged_label", form.lang, steps=len(history) - 1),
                t("energy_label", form.lang, energy=energy(WEIGHT_MATRIX, recalled)),
            ]
        ),
        "comparison_image": comparison_image,
        "trajectory_image": trajectory_image,
        "overlap_image": overlap_image,
    }


@app.route("/", methods=["GET"])
def index():
    form, invalid_fields = _build_form_state()
    result = _run_recall(form) if form.run else None
    lang = form.lang

    return render_template(
        "index.html",
        form=form,
        invalid_fields=invalid_fields,
        has_errors=bool(invalid_fields),
        has_results=result is not None,
        result=result,
        gallery_image=_gallery_image(lang),
        gallery_caption=t(
            "pattern_count",
            lang,
            n=len(PATTERN_NAMES),
            neurons=N_NEURONS,
            cap=int(0.14 * N_NEURONS),
        ),
        mode_options=[
            {"value": "synchronous", "label": t("synchronous", lang)},
            {"value": "asynchronous", "label": t("asynchronous", lang)},
        ],
        pattern_names=PATTERN_NAMES,
        ui={
            "title": t("title", lang),
            "subtitle": t("subtitle", lang),
            "description": _sanitize_text(t("description", lang)),
            "language": t("language", lang),
            "controls": t("controls", lang),
            "pattern": t("pattern", lang),
            "corruption": t("corruption", lang),
            "noise_level": t("noise_level", lang),
            "noise_help": t("noise_help", lang),
            "mask_ratio": t("mask_ratio", lang),
            "mask_help": t("mask_help", lang),
            "recall_settings": t("recall_settings", lang),
            "update_mode": t("update_mode", lang),
            "max_recall_steps": t("max_recall_steps", lang),
            "activation_threshold": t("activation_threshold", lang),
            "random_seed": t("random_seed", lang),
            "run_recall": t("run_recall", lang),
            "running": t("running", lang),
            "view_all_patterns": t("view_all_patterns", lang),
            "result": t("result", lang),
            "accuracy": t("accuracy", lang),
            "errors": t("errors", lang),
            "overlap": t("overlap", lang),
            "nearest_pattern": t("nearest_pattern", lang),
            "recall_trajectory": t("recall_trajectory", lang),
            "overlap_all": t("overlap_all", lang),
            "parameter_notice": t("parameter_notice", lang),
        },
    )


if __name__ == "__main__":
    app.run(debug=True)
