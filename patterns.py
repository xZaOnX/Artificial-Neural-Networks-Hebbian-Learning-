"""
10x10 bipolar patterns for associative memory.
'#' = +1, '.' = -1. Each pattern targets 45-55% fill.
"""

import numpy as np
from typing import Dict, Tuple

PATTERN_CATALOG: Dict[str, list] = {
    "A": [
        "....##....",
        "...####...",
        "..##..##..",
        "..##..##..",
        ".##....##.",
        ".########.",
        ".########.",
        "##......##",
        "##......##",
        "##......##",
    ],
    "E": [
        "########..",
        "########..",
        "###.......",
        "###.......",
        "#######...",
        "###.......",
        "###.......",
        "###.......",
        "########..",
        "..........",
    ],
    "H": [
        ".#......#.",
        ".#......#.",
        ".#......#.",
        ".#......#.",
        ".########.",
        ".########.",
        ".########.",
        ".#......#.",
        ".#......#.",
        ".#......#.",
    ],
    "X": [
        "###....###",
        ".###..###.",
        "..######..",
        "...####...",
        "....##....",
        "....##....",
        "...####...",
        "..######..",
        ".###..###.",
        "###....###",
    ],
    "0": [
        "..######..",
        ".########.",
        "##......##",
        "##......##",
        "##......##",
        "##......##",
        "##......##",
        "##......##",
        ".########.",
        "..######..",
    ],
    "1": [
        "....##....",
        "...###....",
        "..####....",
        "....##....",
        "....##....",
        "....##....",
        "....##....",
        "....##....",
        "##########",
        "##########",
    ],
    "2": [
        "..######..",
        ".##...###.",
        ".......##.",
        "......##..",
        "....###...",
        "...###....",
        "..##......",
        ".##.......",
        ".###...##.",
        "..######..",
    ],
    "3": [
        ".########.",
        "##......##",
        "........##",
        "....######",
        "....######",
        "....######",
        "........##",
        "........##",
        "##......##",
        ".########.",
    ],
    "8": [
        "....####..",
        "...##..##.",
        "...##..##.",
        "...##..##.",
        "....####..",
        "....####..",
        "...##..##.",
        "...##..##.",
        "...##..##.",
        "....####..",
    ],
    "square": [
        ".########.",
        ".########.",
        ".##....##.",
        ".##....##.",
        ".##....##.",
        ".##....##.",
        ".##....##.",
        ".##....##.",
        ".########.",
        "..........",
    ],
    "triangle": [
        "....##....",
        "...####...",
        "...####...",
        "..##..##..",
        "..##..##..",
        ".##....##.",
        ".##....##.",
        "##......##",
        "##########",
        "##########",
    ],
    "plus": [
        "...####...",
        "...####...",
        "...####...",
        "##########",
        "##########",
        "##########",
        "...####...",
        "...####...",
        "...####...",
        "...####...",
    ],
}

GRID_SIZE: int = 10


def pattern_to_bipolar(pattern_strings: list) -> np.ndarray:
    """Convert list-of-strings pattern to flat bipolar vector {-1, +1}."""
    pixels = []
    for row in pattern_strings:
        for ch in row:
            pixels.append(1 if ch == "#" else -1)
    return np.array(pixels, dtype=np.float64)


def bipolar_to_grid(vector: np.ndarray, grid_size: int = GRID_SIZE) -> np.ndarray:
    """Reshape a flat bipolar vector back into a 2D grid."""
    return vector.reshape(grid_size, grid_size)


def get_all_patterns() -> Dict[str, np.ndarray]:
    """Return dict mapping pattern names to their bipolar vectors."""
    return {name: pattern_to_bipolar(rows) for name, rows in PATTERN_CATALOG.items()}


def get_pattern_names() -> list:
    """Return pattern names in catalogue order."""
    return list(PATTERN_CATALOG.keys())


def get_pattern_matrix() -> Tuple[np.ndarray, list]:
    """Return matrix where each column is a stored pattern, plus names.

    Returns
    -------
    P : np.ndarray, shape (N, p)
    names : list of str
    """
    names = get_pattern_names()
    vectors = [pattern_to_bipolar(PATTERN_CATALOG[n]) for n in names]
    P = np.column_stack(vectors)
    return P, names
