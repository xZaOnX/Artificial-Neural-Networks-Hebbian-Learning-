"""
utils.py — Small helper utilities shared across modules.
"""

import numpy as np


def hamming_distance(a: np.ndarray, b: np.ndarray) -> int:
    """Number of positions where two vectors differ."""
    return int(np.sum(a != b))


def accuracy(a: np.ndarray, b: np.ndarray) -> float:
    """Fraction of matching elements between two bipolar vectors (0–1)."""
    return float(np.mean(a == b))


def energy(W: np.ndarray, state: np.ndarray) -> float:
    """Compute the Hopfield energy of a state.

    E = -0.5 * s^T W s

    A lower energy means the state is closer to a stable attractor.
    """
    return float(-0.5 * state @ W @ state)
