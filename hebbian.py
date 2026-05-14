"""
Hebbian autoassociative memory: weight matrix construction and recall.
"""

from __future__ import annotations

import numpy as np
from typing import Tuple


def build_weight_matrix(patterns: np.ndarray, zero_diagonal: bool = True) -> np.ndarray:
    """Construct the Hebbian weight matrix W = (1/N) * P @ P^T.

    Parameters
    ----------
    patterns : np.ndarray, shape (N, p)
        Each column is one stored bipolar pattern vector.
    zero_diagonal : bool
        If True, set the diagonal of W to zero to prevent self-reinforcement.

    Returns
    -------
    W : np.ndarray, shape (N, N)
    """
    N, p = patterns.shape

    W = patterns @ patterns.T / N

    if zero_diagonal:
        np.fill_diagonal(W, 0.0)

    return W


def recall_synchronous(
    W: np.ndarray,
    probe: np.ndarray,
    steps: int = 10,
    threshold: float = 0.0,
) -> Tuple[np.ndarray, list]:
    """Synchronous recall: update all neurons at once per step.

    Parameters
    ----------
    W : np.ndarray, shape (N, N)
    probe : np.ndarray, shape (N,)
    steps : int
    threshold : float
        Dead-zone width around zero; neurons within keep their value.

    Returns
    -------
    state : np.ndarray, shape (N,)
    history : list of np.ndarray
    """
    state = probe.copy()
    history = [state.copy()]

    for _ in range(steps):
        h = W @ state

        new_state = np.where(h > threshold, 1.0,
                             np.where(h < -threshold, -1.0, state))
        history.append(new_state.copy())

        if np.array_equal(new_state, state):
            break
        state = new_state

    return state, history


def recall_asynchronous(
    W: np.ndarray,
    probe: np.ndarray,
    steps: int = 10,
    threshold: float = 0.0,
    rng: np.random.Generator | None = None,
) -> Tuple[np.ndarray, list]:
    """Asynchronous recall: update one neuron at a time in random order.

    One step = one full sweep through all neurons.

    Parameters
    ----------
    W : np.ndarray, shape (N, N)
    probe : np.ndarray, shape (N,)
    steps : int
    threshold : float
    rng : np.random.Generator or None

    Returns
    -------
    state : np.ndarray
    history : list of np.ndarray
    """
    if rng is None:
        rng = np.random.default_rng()

    N = len(probe)
    state = probe.copy()
    history = [state.copy()]

    for _ in range(steps):
        order = rng.permutation(N)
        for i in order:
            h_i = W[i] @ state
            if h_i > threshold:
                state[i] = 1.0
            elif h_i < -threshold:
                state[i] = -1.0
        history.append(state.copy())

        if np.array_equal(history[-1], history[-2]):
            break

    return state, history


def overlap(a: np.ndarray, b: np.ndarray) -> float:
    """Normalised dot-product similarity between two bipolar vectors. Range: [-1, +1]."""
    return float(np.dot(a, b) / len(a))


def find_nearest_pattern(
    state: np.ndarray,
    patterns: np.ndarray,
    names: list,
) -> Tuple[str, float]:
    """Find the stored pattern most similar to the given state."""
    overlaps = patterns.T @ state / len(state)
    idx = int(np.argmax(overlaps))
    return names[idx], float(overlaps[idx])


def count_errors(a: np.ndarray, b: np.ndarray) -> int:
    """Count differing elements between two bipolar vectors."""
    return int(np.sum(a != b))
