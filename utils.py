"""
Small helper utilities shared across modules.
"""

import numpy as np


def hamming_distance(a: np.ndarray, b: np.ndarray) -> int:
    """Number of positions where two vectors differ."""
    return int(np.sum(a != b))


def accuracy(a: np.ndarray, b: np.ndarray) -> float:
    """Fraction of matching elements (0-1)."""
    return float(np.mean(a == b))


def energy(W: np.ndarray, state: np.ndarray) -> float:
    """Hopfield energy: E = -0.5 * s^T W s"""
    return float(-0.5 * state @ W @ state)
