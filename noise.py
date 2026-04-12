"""
noise.py — Functions to corrupt bipolar pattern vectors with noise or masking.
"""

import numpy as np


def add_noise(
    vector: np.ndarray,
    noise_level: float,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Flip a fraction of cells in a bipolar vector.

    Parameters
    ----------
    vector : np.ndarray, shape (N,)
        Original bipolar vector with values in {-1, +1}.
    noise_level : float
        Fraction of cells to flip, in [0, 1].  0 = no noise, 1 = all flipped.
    rng : np.random.Generator or None

    Returns
    -------
    corrupted : np.ndarray, shape (N,)
        Copy of the vector with some cells inverted.
    """
    if rng is None:
        rng = np.random.default_rng()

    corrupted = vector.copy()
    N = len(vector)
    n_flip = int(round(noise_level * N))

    if n_flip > 0:
        indices = rng.choice(N, size=n_flip, replace=False)
        corrupted[indices] *= -1  # flip selected cells

    return corrupted


def apply_masking(
    vector: np.ndarray,
    mask_ratio: float,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Set a fraction of cells to zero (unknown / missing).

    Zeroed cells are ambiguous — they carry no information and the recall
    process must reconstruct them from context.

    Parameters
    ----------
    vector : np.ndarray, shape (N,)
    mask_ratio : float
        Fraction of cells to zero out, in [0, 1].
    rng : np.random.Generator or None

    Returns
    -------
    masked : np.ndarray, shape (N,)
    """
    if rng is None:
        rng = np.random.default_rng()

    masked = vector.copy()
    N = len(vector)
    n_mask = int(round(mask_ratio * N))

    if n_mask > 0:
        indices = rng.choice(N, size=n_mask, replace=False)
        masked[indices] = 0.0  # zero = unknown

    return masked


def corrupt(
    vector: np.ndarray,
    noise_level: float = 0.0,
    mask_ratio: float = 0.0,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Apply noise AND masking in sequence.

    Noise flipping is applied first, then masking.  This means some of
    the flipped cells may also be masked (set to zero).

    Parameters
    ----------
    vector : np.ndarray
    noise_level : float
    mask_ratio : float
    rng : np.random.Generator or None

    Returns
    -------
    corrupted : np.ndarray
    """
    if rng is None:
        rng = np.random.default_rng()

    result = vector.copy()
    if noise_level > 0:
        result = add_noise(result, noise_level, rng)
    if mask_ratio > 0:
        result = apply_masking(result, mask_ratio, rng)
    return result
