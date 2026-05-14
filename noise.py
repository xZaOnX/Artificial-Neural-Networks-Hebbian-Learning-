"""
Functions to corrupt bipolar pattern vectors with noise or masking.
"""

import numpy as np


def add_noise(
    vector: np.ndarray,
    noise_level: float,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Flip a fraction of cells in a bipolar vector."""
    if rng is None:
        rng = np.random.default_rng()

    corrupted = vector.copy()
    N = len(vector)
    n_flip = int(round(noise_level * N))

    if n_flip > 0:
        indices = rng.choice(N, size=n_flip, replace=False)
        corrupted[indices] *= -1

    return corrupted


def apply_masking(
    vector: np.ndarray,
    mask_ratio: float,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Set a fraction of cells to zero (unknown/missing)."""
    if rng is None:
        rng = np.random.default_rng()

    masked = vector.copy()
    N = len(vector)
    n_mask = int(round(mask_ratio * N))

    if n_mask > 0:
        indices = rng.choice(N, size=n_mask, replace=False)
        masked[indices] = 0.0

    return masked


def corrupt(
    vector: np.ndarray,
    noise_level: float = 0.0,
    mask_ratio: float = 0.0,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Apply noise then masking in sequence."""
    if rng is None:
        rng = np.random.default_rng()

    result = vector.copy()
    if noise_level > 0:
        result = add_noise(result, noise_level, rng)
    if mask_ratio > 0:
        result = apply_masking(result, mask_ratio, rng)
    return result
