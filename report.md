# Interactive Noisy Pattern Recall Using Hebbian Learning
### Artificial Neural Networks — Project Report

**Student:** Ozan Oneyman  
**Date:** April 2026  
**YouTube Video:** [ADD LINK HERE]

---

## 1. Dataset

We designed **12 hand-crafted 10×10 bipolar patterns** ({-1, +1} valued, 100 neurons each):

| Category | Patterns |
|----------|----------|
| Letters  | A, E, H, X |
| Digits   | 0, 1, 2, 3, 8 |
| Shapes   | Square, Triangle, Plus |

Each pattern is a 10-row × 10-column binary grid where `#` maps to +1 (active neuron) and `.` maps to −1 (inactive neuron). Patterns were designed with 45–55% fill ratio and spatially distinct structure to minimize pairwise correlation and reduce interference.

---

## 2. Method

### Hebbian Autoassociative Memory

The network is a fully connected recurrent network of **N = 100 neurons**. The weight matrix is computed from the Hebbian outer-product rule:

```
W = (1/N) × Σᵢ xᵢ xᵢᵀ
```

where xᵢ is the i-th stored pattern vector (shape 100×1). The diagonal of W is set to zero to prevent self-reinforcement.

### Recall

Given a corrupted input probe **s**, the network reconstructs the stored pattern through iterative updates until convergence:

**Synchronous update** — all neurons update simultaneously each step:
```
s(t+1) = sign(W · s(t))
```

**Asynchronous update** — neurons update one at a time in random order within each sweep, using the latest state values immediately.

Both modes use a dead-zone threshold: if the net input |h_i| < θ, neuron i keeps its current value.

### Noise & Corruption

Two corruption modes were applied to probe patterns:
- **Noise:** randomly flips a fraction of cells (+1 ↔ −1)
- **Masking:** zeroes out a fraction of cells (missing data)

---

## 3. Results

### Theoretical Capacity

For N = 100 neurons, the Hopfield/Hebbian capacity limit is approximately:

```
P_max ≈ 0.14 × N = 0.14 × 100 = 14 patterns
```

With 12 stored patterns, the network operates **just below this limit**, which means most patterns are stable fixed points but some cross-pattern interference is visible.

### Success Rate vs. Noise Level

Success is defined as the recalled pattern having **≥ 90% overlap** with the original stored pattern (standard criterion for Hopfield networks). Each result is averaged over 100 trials per pattern.

| Noise Level | Sync Success Rate | Async Success Rate |
|:-----------:|:-----------------:|:------------------:|
| 0%          | 83.3%             | 83.3%              |
| 10%         | 77.3%             | 76.8%              |
| 20%         | 64.1%             | 62.8%              |
| 30%         | 42.7%             | 40.9%              |
| 40%         | 9.8%              | 9.7%               |
| 50%         | 0.2%              | 0.2%               |

### Key Observations

- **Low noise (0–20%):** The network successfully recalls most patterns, achieving 64–83% success. The ~17% base failure at 0% noise is due to a small number of patterns that do not form perfectly stable fixed points — a direct consequence of operating near the storage capacity limit.
- **Medium noise (30%):** Recall drops to ~42%, as cross-pattern interference dominates for heavily corrupted probes.
- **High noise (40–50%):** Recall fails almost entirely — corrupted probes fall into spurious attractors or other stored patterns.
- **Synchronous vs Asynchronous:** Both update modes perform nearly identically, with asynchronous slightly better at medium-high noise levels due to immediate propagation of updates within each sweep.

### Failure Modes Observed

- **Spurious attractors:** The network converges to states that were never stored (mixtures of patterns).
- **Pattern confusion:** Similar patterns (e.g., A and Triangle both have a peak at the top) occasionally confuse the network.

---

## 4. Conclusion

The Hebbian autoassociative memory successfully demonstrates content-addressable memory behaviour: given a noisy or partial version of a stored pattern, the network reconstructs the original through energy minimization. Recall quality degrades gracefully with noise and breaks down near the theoretical capacity limit (~14 patterns for 100 neurons). The interactive UI allows live parameter adjustment — noise level, masking ratio, update mode, and number of steps — making the capacity and failure mode phenomena directly observable.

---

*Code repository: [GitHub link] | Video: [YouTube link]*
