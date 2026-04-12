"""
visualization.py — Matplotlib helpers for displaying 10x10 bipolar grids.

Uses a dark theme with a curated colour palette for a polished look
when embedded in the Streamlit app.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from matplotlib.figure import Figure
from patterns import GRID_SIZE
from translations import t

# ── Colour palette ──────────────────────────────────────────────────
# -1 → deep slate,  0 (masked) → muted grey,  +1 → warm amber
_COLOURS = ["#1e293b", "#64748b", "#f59e0b"]
_CMAP = mcolors.ListedColormap(_COLOURS)
_NORM = mcolors.BoundaryNorm([-1.5, -0.5, 0.5, 1.5], _CMAP.N)

# ── Shared figure style ────────────────────────────────────────────
_BG = "#0e1117"        # matches Streamlit dark theme
_TEXT = "#e2e8f0"       # light text on dark bg
_ACCENT = "#f59e0b"     # amber accent


def _style_ax(ax: plt.Axes, title: str = "") -> None:
    """Apply consistent styling to a single grid axes."""
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)
    if title:
        ax.set_title(title, fontsize=11, fontweight="600",
                      color=_TEXT, pad=8, fontfamily="sans-serif")


def _style_fig(fig: Figure) -> None:
    """Set transparent background so the figure blends into Streamlit."""
    fig.patch.set_facecolor("none")
    fig.patch.set_alpha(0)
    for ax in fig.get_axes():
        ax.set_facecolor("none")


def plot_single_pattern(
    vector: np.ndarray,
    title: str = "",
    ax: plt.Axes | None = None,
    grid_size: int = GRID_SIZE,
) -> plt.Axes:
    """Display one bipolar vector as a coloured grid."""
    if ax is None:
        _, ax = plt.subplots(figsize=(3, 3))
    grid = vector.reshape(grid_size, grid_size)
    ax.imshow(grid, cmap=_CMAP, norm=_NORM, interpolation="nearest",
              aspect="equal")
    _style_ax(ax, title)
    return ax


def plot_comparison(
    original: np.ndarray,
    corrupted: np.ndarray,
    recalled: np.ndarray,
    pattern_name: str = "",
    grid_size: int = GRID_SIZE,
    lang: str = "en",
) -> Figure:
    """Three side-by-side grids: original → corrupted → recalled."""
    fig, axes = plt.subplots(1, 3, figsize=(10, 3.4),
                             gridspec_kw={"wspace": 0.25})

    labels = [t("original", lang), t("corrupted", lang), t("recalled", lang)]
    data = [original, corrupted, recalled]

    for ax, vec, label in zip(axes, data, labels):
        plot_single_pattern(vec, label, ax, grid_size)

    _style_fig(fig)
    return fig


def plot_recall_history(
    history: list,
    grid_size: int = GRID_SIZE,
    max_show: int = 8,
    lang: str = "en",
) -> Figure:
    """Show the recall trajectory (state snapshots)."""
    n = len(history)
    indices = list(range(n)) if n <= max_show else \
              np.linspace(0, n - 1, max_show, dtype=int).tolist()

    cols = len(indices)
    fig, axes = plt.subplots(1, cols, figsize=(2.4 * cols, 3),
                             gridspec_kw={"wspace": 0.20})
    if cols == 1:
        axes = [axes]

    for ax, idx in zip(axes, indices):
        plot_single_pattern(history[idx], t("step", lang, i=idx), ax, grid_size)

    _style_fig(fig)
    return fig


def plot_all_stored_patterns(
    patterns_dict: dict,
    grid_size: int = GRID_SIZE,
    lang: str = "en",
) -> Figure:
    """Plot every stored pattern in a compact grid."""
    names = list(patterns_dict.keys())
    n = len(names)
    cols = 6
    rows = (n + cols - 1) // cols

    fig, axes = plt.subplots(rows, cols, figsize=(2.2 * cols, 2.6 * rows),
                             gridspec_kw={"wspace": 0.20, "hspace": 0.45})
    axes = np.array(axes).flatten()

    for i, name in enumerate(names):
        plot_single_pattern(patterns_dict[name], name, axes[i], grid_size)

    for j in range(n, len(axes)):
        axes[j].set_visible(False)

    _style_fig(fig)
    return fig


def plot_overlap_bars(
    overlaps: dict,
    highlight: str = "",
    lang: str = "en",
) -> Figure:
    """Horizontal bar chart of overlap values with every stored pattern."""
    names = list(overlaps.keys())
    values = list(overlaps.values())

    fig, ax = plt.subplots(figsize=(7, max(3, 0.38 * len(names))))

    colours = [_ACCENT if n == highlight else "#475569" for n in names]
    bars = ax.barh(names, values, color=colours, height=0.65, edgecolor="none")

    ax.set_xlim(-1.05, 1.05)
    ax.axvline(0, color="#334155", linewidth=0.8)
    ax.set_xlabel(t("overlap", lang), fontsize=10, color=_TEXT)
    ax.tick_params(colors=_TEXT, labelsize=9)
    ax.invert_yaxis()

    for spine in ax.spines.values():
        spine.set_visible(False)

    _style_fig(fig)
    fig.tight_layout()
    return fig
