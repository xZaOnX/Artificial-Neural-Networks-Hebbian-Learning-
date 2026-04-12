"""
hebbian.py — Hebbian autoassociative memory: weight matrix and recall logic.

The weight matrix is built from the outer-product rule (Hebb rule).
Recall supports both synchronous and asynchronous (random-order) updates.
"""

import numpy as np
from typing import Tuple


# ===================================================================
# Weight matrix construction
# ===================================================================

def build_weight_matrix(patterns: np.ndarray, zero_diagonal: bool = True) -> np.ndarray:
    """Construct the Hebbian weight matrix from stored patterns.

    The Hebbian rule accumulates outer products of every stored pattern:

        W = (1/N) * sum_i  x_i  x_i^T

    where N is the number of neurons (dimensionality of each pattern).

    Parameters
    ----------
    patterns : np.ndarray, shape (N, p)
        Each column is one stored bipolar pattern vector.
    zero_diagonal : bool
        If True, set the diagonal of W to zero.  This prevents self-
        reinforcement and generally improves recall quality.

    Returns
    -------
    W : np.ndarray, shape (N, N)
        Symmetric weight matrix.
    """
    N, p = patterns.shape  # N = number of neurons, p = number of patterns

    # Accumulate outer products ------------------------------------------
    # Mathematically: W = (1/N) * P @ P^T
    W = patterns @ patterns.T  # shape (N, N)
    W = W / N  # normalise by number of neurons

    # Zero the diagonal --------------------------------------------------
    # Why: a neuron should not reinforce itself; self-connections add a
    # constant bias that does not carry pattern information and can push
    # the network toward trivial fixed points.
    if zero_diagonal:
        np.fill_diagonal(W, 0.0)

    return W


# ===================================================================
# Recall / update rules
# ===================================================================

def recall_synchronous(
    W: np.ndarray,
    probe: np.ndarray,
    steps: int = 10,
    threshold: float = 0.0,
) -> Tuple[np.ndarray, list]:
    """Synchronous (parallel) recall: update all neurons at once.

    At each step:
        s(t+1) = sign( W @ s(t) )

    When the net input for a neuron falls within the dead-zone
    [-threshold, +threshold], the neuron keeps its current value.

    Parameters
    ----------
    W : np.ndarray, shape (N, N)
    probe : np.ndarray, shape (N,)
        The noisy / corrupted input vector (bipolar).
    steps : int
        Maximum number of update iterations.
    threshold : float
        Dead-zone width around zero.  Larger values make the network
        more conservative (fewer flips per step).

    Returns
    -------
    state : np.ndarray, shape (N,)
        The network state after recall.
    history : list of np.ndarray
        Network state at each step (useful for visualization/debugging).
    """
    state = probe.copy()
    history = [state.copy()]

    for _ in range(steps):
        h = W @ state  # net input for every neuron

        # Apply sign with tie-breaking: keep current state in dead-zone
        new_state = np.where(h > threshold, 1.0,
                             np.where(h < -threshold, -1.0, state))
        history.append(new_state.copy())

        # Early stop if the state has converged (no change)
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
    """Asynchronous (sequential) recall: update one neuron at a time.

    One "step" here means one full sweep through all neurons in random
    order.  Each neuron is updated immediately so that subsequent neurons
    in the same sweep see the latest values.

    Parameters
    ----------
    W : np.ndarray, shape (N, N)
    probe : np.ndarray, shape (N,)
    steps : int
        Number of full sweeps through all neurons.
    threshold : float
    rng : np.random.Generator or None
        Random generator for reproducibility.

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
        order = rng.permutation(N)  # random visit order
        for i in order:
            h_i = W[i] @ state  # net input for neuron i
            if h_i > threshold:
                state[i] = 1.0
            elif h_i < -threshold:
                state[i] = -1.0
            # else: keep current value (within dead-zone)
        history.append(state.copy())

        # Check convergence against previous snapshot
        if np.array_equal(history[-1], history[-2]):
            break

    return state, history


# ===================================================================
# Evaluation helpers
# ===================================================================

def overlap(a: np.ndarray, b: np.ndarray) -> float:
    """Normalised overlap (dot-product similarity) between two bipolar vectors.

    Returns a value in [-1, +1].  +1 means identical, -1 means inverted.
    """
    return float(np.dot(a, b) / len(a))


def find_nearest_pattern(
    state: np.ndarray,
    patterns: np.ndarray,
    names: list,
) -> Tuple[str, float]:
    """Find the stored pattern most similar to *state*.

    Parameters
    ----------
    state : np.ndarray, shape (N,)
    patterns : np.ndarray, shape (N, p)
    names : list of str

    Returns
    -------
    best_name : str
    best_overlap : float
    """
    overlaps = patterns.T @ state / len(state)  # shape (p,)
    idx = int(np.argmax(overlaps))
    return names[idx], float(overlaps[idx])


def count_errors(a: np.ndarray, b: np.ndarray) -> int:
    """Count the number of differing elements between two bipolar vectors."""
    return int(np.sum(a != b))
