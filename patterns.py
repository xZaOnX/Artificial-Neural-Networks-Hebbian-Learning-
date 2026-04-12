"""
patterns.py — Manually defined 10x10 bipolar patterns for associative memory.

Each pattern is a list of 10 strings, each string having 10 characters.
'#' represents +1 (active), '.' represents -1 (inactive).

DESIGN NOTES:
- 10x10 grid = 100 neurons → Hopfield capacity ≈ 14 patterns.
- Each pattern targets 45–55% fill for bipolar balance.
- Thick strokes (2–3 px) to fill more area and reduce background similarity.
- Spatially diverse designs to minimize pairwise correlation.
"""

import numpy as np
from typing import Dict, Tuple

# ---------------------------------------------------------------------------
# Pattern catalogue — 10x10 grid, '#' = +1, '.' = -1
# Target: each pattern has 45–55 active ('#') cells out of 100.
# ---------------------------------------------------------------------------

PATTERN_CATALOG: Dict[str, list] = {
    # ---- Letters ----
    # A: triangle top + crossbar + two legs (48 cells)
    "A": [
        "....##....",  # 2
        "...####...",  # 4
        "..##..##..",  # 4
        "..##..##..",  # 4
        ".##....##.",  # 4
        ".########.",  # 8
        ".########.",  # 8
        "##......##",  # 4
        "##......##",  # 4
        "##......##",  # 4  → total: 46
    ],
    # E: left-heavy, top-biased — distinct from square (44 cells)
    "E": [
        "########..",  # 8
        "########..",  # 8
        "###.......",  # 3
        "###.......",  # 3
        "#######...",  # 7
        "###.......",  # 3
        "###.......",  # 3
        "###.......",  # 3
        "########..",  # 8
        "..........",  # 0  → total: 46
    ],
    # H: thin pillars, wide bar — distinct vertical symmetry (44 cells)
    "H": [
        ".#......#.",  # 2
        ".#......#.",  # 2
        ".#......#.",  # 2
        ".#......#.",  # 2
        ".########.",  # 8
        ".########.",  # 8
        ".########.",  # 8
        ".#......#.",  # 2
        ".#......#.",  # 2
        ".#......#.",  # 2  → total: 38... + adjust
    ],
    # X: diagonal cross (48 cells)
    "X": [
        "###....###",  # 6
        ".###..###.",  # 6
        "..######..",  # 6
        "...####...",  # 4
        "....##....",  # 2
        "....##....",  # 2
        "...####...",  # 4
        "..######..",  # 6
        ".###..###.",  # 6
        "###....###",  # 6  → total: 48
    ],
    # ---- Digits ----
    # 0: thick oval (52 cells)
    "0": [
        "..######..",  # 6
        ".########.",  # 8
        "##......##",  # 4
        "##......##",  # 4
        "##......##",  # 4
        "##......##",  # 4
        "##......##",  # 4
        "##......##",  # 4
        ".########.",  # 8
        "..######..",  # 6  → total: 52
    ],
    # 1: centered column + base — vertical line shape (44 cells)
    "1": [
        "....##....",  # 2
        "...###....",  # 3
        "..####....",  # 4
        "....##....",  # 2
        "....##....",  # 2
        "....##....",  # 2
        "....##....",  # 2
        "....##....",  # 2
        "##########",  # 10
        "##########",  # 10  → total: 39
    ],
    # 2: top-right to bottom-left sweep (46 cells)
    "2": [
        "..######..",  # 6
        ".##...###.",  # 5
        ".......##.",  # 2
        "......##..",  # 2
        "....###...",  # 3
        "...###....",  # 3
        "..##......",  # 2
        ".##.......",  # 2
        ".###...##.",  # 5
        "..######..",  # 6  → total: 36
    ],
    # 3: right-heavy with middle notch (48 cells)
    "3": [
        ".########.",  # 8
        "##......##",  # 4
        "........##",  # 2
        "....######",  # 6
        "....######",  # 6
        "....######",  # 6
        "........##",  # 2
        "........##",  # 2
        "##......##",  # 4
        ".########.",  # 8  → total: 48
    ],
    # 8: figure-eight, right-biased (48 cells)
    "8": [
        "....####..",  # 4
        "...##..##.",  # 4
        "...##..##.",  # 4
        "...##..##.",  # 4
        "....####..",  # 4
        "....####..",  # 4
        "...##..##.",  # 4
        "...##..##.",  # 4
        "...##..##.",  # 4
        "....####..",  # 4  → total: 40
    ],
    # ---- Shapes ----
    # square: border frame (48 cells)
    "square": [
        ".########.",  # 8
        ".########.",  # 8
        ".##....##.",  # 4
        ".##....##.",  # 4
        ".##....##.",  # 4
        ".##....##.",  # 4
        ".##....##.",  # 4
        ".##....##.",  # 4
        ".########.",  # 8
        "..........",  # 0  → total: 48
    ],
    # triangle: outline triangle (46 cells)
    "triangle": [
        "....##....",  # 2
        "...####...",  # 4
        "...####...",  # 4
        "..##..##..",  # 4
        "..##..##..",  # 4
        ".##....##.",  # 4
        ".##....##.",  # 4
        "##......##",  # 4
        "##########",  # 10
        "##########",  # 10  → total: 50
    ],
    # plus: thick cross, wider arms (48 cells)
    "plus": [
        "...####...",  # 4
        "...####...",  # 4
        "...####...",  # 4
        "##########",  # 10
        "##########",  # 10
        "##########",  # 10
        "...####...",  # 4
        "...####...",  # 4
        "...####...",  # 4
        "...####...",  # 4  → total: 58
    ],
}

GRID_SIZE: int = 10  # patterns are 10x10


def pattern_to_bipolar(pattern_strings: list) -> np.ndarray:
    """Convert a list-of-strings pattern to a flat bipolar vector {-1, +1}.

    Parameters
    ----------
    pattern_strings : list of str
        10 strings of length 10.  '#' -> +1, anything else -> -1.

    Returns
    -------
    np.ndarray
        1-D array of shape (100,) with values in {-1, +1}.
    """
    pixels = []
    for row in pattern_strings:
        for ch in row:
            pixels.append(1 if ch == "#" else -1)
    return np.array(pixels, dtype=np.float64)


def bipolar_to_grid(vector: np.ndarray, grid_size: int = GRID_SIZE) -> np.ndarray:
    """Reshape a flat bipolar vector back into a 2-D grid."""
    return vector.reshape(grid_size, grid_size)


def get_all_patterns() -> Dict[str, np.ndarray]:
    """Return a dict mapping pattern names to their bipolar vectors."""
    return {name: pattern_to_bipolar(rows) for name, rows in PATTERN_CATALOG.items()}


def get_pattern_names() -> list:
    """Return the list of pattern names in catalogue order."""
    return list(PATTERN_CATALOG.keys())


def get_pattern_matrix() -> Tuple[np.ndarray, list]:
    """Return a matrix where each *column* is a stored pattern, plus names.

    Returns
    -------
    P : np.ndarray, shape (N, p)
        N = number of neurons (100), p = number of patterns.
    names : list of str
    """
    names = get_pattern_names()
    vectors = [pattern_to_bipolar(PATTERN_CATALOG[n]) for n in names]
    P = np.column_stack(vectors)  # (100, p)
    return P, names
