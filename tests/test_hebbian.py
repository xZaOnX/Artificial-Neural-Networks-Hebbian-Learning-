"""
tests/test_hebbian.py — Basic tests for the Hebbian memory system.

Run with:
    python -m pytest tests/ -v
"""

import numpy as np
import pytest

from patterns import (
    pattern_to_bipolar,
    bipolar_to_grid,
    get_pattern_matrix,
    GRID_SIZE,
    PATTERN_CATALOG,
)
from hebbian import (
    build_weight_matrix,
    recall_synchronous,
    recall_asynchronous,
    overlap,
    find_nearest_pattern,
    count_errors,
)
from noise import add_noise, apply_masking, corrupt


# ───────────────────────────────────────────────────────────────────
# Pattern conversion
# ───────────────────────────────────────────────────────────────────

class TestPatterns:
    def test_bipolar_values(self):
        vec = pattern_to_bipolar(PATTERN_CATALOG["A"])
        unique = set(vec.tolist())
        assert unique <= {-1.0, 1.0}, "Expected only -1 and +1"

    def test_vector_length(self):
        vec = pattern_to_bipolar(PATTERN_CATALOG["A"])
        assert vec.shape == (GRID_SIZE * GRID_SIZE,)

    def test_grid_roundtrip(self):
        vec = pattern_to_bipolar(PATTERN_CATALOG["E"])
        grid = bipolar_to_grid(vec)
        assert grid.shape == (GRID_SIZE, GRID_SIZE)
        assert np.array_equal(grid.flatten(), vec)

    def test_all_patterns_defined(self):
        assert len(PATTERN_CATALOG) >= 12, "Need at least 12 patterns"


# ───────────────────────────────────────────────────────────────────
# Weight matrix
# ───────────────────────────────────────────────────────────────────

class TestWeightMatrix:
    def setup_method(self):
        self.P, self.names = get_pattern_matrix()
        self.N = self.P.shape[0]

    def test_shape(self):
        W = build_weight_matrix(self.P)
        assert W.shape == (self.N, self.N)

    def test_symmetry(self):
        W = build_weight_matrix(self.P)
        assert np.allclose(W, W.T), "Weight matrix must be symmetric"

    def test_zero_diagonal(self):
        W = build_weight_matrix(self.P, zero_diagonal=True)
        assert np.allclose(np.diag(W), 0.0), "Diagonal should be zero"

    def test_nonzero_diagonal_option(self):
        W = build_weight_matrix(self.P, zero_diagonal=False)
        # Diagonal should be non-zero (sum of squares / N)
        assert not np.allclose(np.diag(W), 0.0)


# ───────────────────────────────────────────────────────────────────
# Recall
# ───────────────────────────────────────────────────────────────────

class TestRecall:
    def setup_method(self):
        self.P, self.names = get_pattern_matrix()
        self.W = build_weight_matrix(self.P)

    def test_clean_recall_synchronous(self):
        """Clean recall: most patterns should recall well above chance.

        With 15 patterns in 64 neurons we exceed Hopfield capacity (~9),
        so some patterns will suffer from interference.  We check that
        *most* (at least 60%) patterns recall with overlap > 0.5.
        """
        good = 0
        for i, name in enumerate(self.names):
            pattern = self.P[:, i]
            recalled, _ = recall_synchronous(self.W, pattern, steps=10)
            assert recalled.shape == pattern.shape
            if overlap(recalled, pattern) > 0.5:
                good += 1
        ratio = good / len(self.names)
        assert ratio >= 0.6, f"Only {good}/{len(self.names)} patterns recalled well"

    def test_small_set_clean_recall(self):
        """With few distinct patterns (within capacity) clean recall is good."""
        pick = ["X", "1", "3", "square", "plus"]
        indices = [self.names.index(n) for n in pick]
        P_small = self.P[:, indices]
        W_small = build_weight_matrix(P_small)
        for i, name in enumerate(pick):
            pattern = P_small[:, i]
            recalled, _ = recall_synchronous(W_small, pattern, steps=10)
            ovlp = overlap(recalled, pattern)
            assert ovlp > 0.85, f"{name}: overlap {ovlp:.3f} too low"

    def test_noisy_recall_small_set(self):
        """Light noise (10%) with a small distinct set should recall correctly."""
        pick = ["X", "1", "3", "square", "plus"]
        indices = [self.names.index(n) for n in pick]
        P_small = self.P[:, indices]
        W_small = build_weight_matrix(P_small)
        rng = np.random.default_rng(123)
        pattern = P_small[:, 0]
        noisy = add_noise(pattern, 0.10, rng)
        recalled, _ = recall_synchronous(W_small, noisy, steps=20)
        best_name, _ = find_nearest_pattern(recalled, P_small, pick)
        assert best_name == pick[0]

    def test_recall_output_shape(self):
        pattern = self.P[:, 0]
        recalled, history = recall_synchronous(self.W, pattern, steps=3)
        assert recalled.shape == (self.P.shape[0],)
        assert len(history) >= 1

    def test_asynchronous_recall_runs(self):
        rng = np.random.default_rng(0)
        pattern = self.P[:, 0]
        recalled, history = recall_asynchronous(self.W, pattern, steps=5, rng=rng)
        assert recalled.shape == pattern.shape
        assert len(history) >= 1


# ───────────────────────────────────────────────────────────────────
# Noise / masking
# ───────────────────────────────────────────────────────────────────

class TestNoise:
    def test_noise_flips_correct_count(self):
        rng = np.random.default_rng(0)
        vec = np.ones(64)
        noisy = add_noise(vec, 0.25, rng)
        flipped = int(np.sum(vec != noisy))
        assert flipped == 16  # 25% of 64

    def test_masking_zeros_correct_count(self):
        rng = np.random.default_rng(0)
        vec = np.ones(64)
        masked = apply_masking(vec, 0.5, rng)
        n_zeros = int(np.sum(masked == 0))
        assert n_zeros == 32

    def test_corrupt_combined(self):
        rng = np.random.default_rng(0)
        vec = np.ones(64)
        result = corrupt(vec, noise_level=0.1, mask_ratio=0.1, rng=rng)
        assert result.shape == vec.shape


# ───────────────────────────────────────────────────────────────────
# Utility functions
# ───────────────────────────────────────────────────────────────────

class TestHelpers:
    def test_overlap_identical(self):
        v = np.array([1, -1, 1, -1], dtype=float)
        assert overlap(v, v) == pytest.approx(1.0)

    def test_overlap_inverted(self):
        v = np.array([1, -1, 1, -1], dtype=float)
        assert overlap(v, -v) == pytest.approx(-1.0)

    def test_count_errors_zero(self):
        v = np.ones(10)
        assert count_errors(v, v) == 0

    def test_count_errors_all(self):
        v = np.ones(10)
        assert count_errors(v, -v) == 10
