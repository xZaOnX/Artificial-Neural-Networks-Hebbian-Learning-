# Interactive Noisy Pattern Recall Using Hebbian Learning

An educational demo of **autoassociative memory** built with the **Hebbian (outer-product) learning rule**. The system stores 15 hand-crafted 8×8 bipolar patterns (letters, digits, shapes), corrupts them with noise or masking, and recalls the original pattern through iterative network updates — all exposed through an interactive Streamlit interface.

---

## Project goal

Demonstrate how a simple neural network can act as a **content-addressable memory**: given a partial or noisy version of a stored pattern, the network reconstructs the full original. The project is designed for an Artificial Neural Networks university course.

---

## How it works

### 1. Hebbian autoassociative memory

Each pattern is a vector of bipolar values {-1, +1} (64 elements for an 8×8 grid). Storage uses the **Hebb rule**: the weight matrix is the (normalised) sum of outer products of all stored patterns:

```
W = (1/N) Σᵢ xᵢ xᵢᵀ
```

The diagonal of W is set to zero to prevent self-reinforcement.

### 2. Recall

Given a noisy input **s**, the network iteratively updates:

```
s(t+1) = sign(W · s(t))
```

until convergence. Two update modes are available:

- **Synchronous** — all neurons update at once each step.
- **Asynchronous** — neurons update one at a time in random order, seeing the latest values immediately.

### 3. Noise and masking

- **Noise**: randomly flips a fraction of cells (+1 ↔ -1).
- **Masking**: zeroes out a fraction of cells (representing missing data).

Both can be combined. The network uses correlations in the weight matrix to reconstruct the original pattern.

### 4. Capacity and limitations

A network of N neurons can reliably store approximately **0.14 × N** patterns (about 9 for N=64). With 15 stored patterns we intentionally exceed this limit, so you will observe:

- **Interference** — similar patterns may confuse the network.
- **Spurious attractors** — the network may converge to a state that was never stored.
- **Partial recall** — the recalled pattern may be a mixture of stored patterns.

These failure modes are **educational** — they illustrate fundamental limits of Hopfield / Hebbian networks.

---

## Stored patterns

| Letters | Digits | Shapes   |
|---------|--------|----------|
| A E H   | 0 1 2  | square   |
| K M X   | 3 8    | triangle |
|         |        | plus     |
|         |        | circle   |

All patterns are defined in `patterns.py` and can be easily edited.

---

## Installation

```bash
# 1. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# 2. Install dependencies
pip install -r requirements.txt
```

---

## Running the app

```bash
streamlit run app.py
```

The app opens in your browser. Use the sidebar to:

1. Select a stored pattern.
2. Set noise level and masking ratio.
3. Choose update mode, recall steps, and threshold.
4. Click **Run recall** to see the result.

---

## Running tests

```bash
python -m pytest tests/ -v
```

---

## Example usage

1. Select pattern **"A"**.
2. Set noise level to **0.20** (20% of cells flipped).
3. Leave masking at 0.
4. Click **Run recall**.
5. Observe the original, corrupted, and recalled grids side by side.
6. Increase noise to 0.40 and notice that recall starts failing.

---

## Project structure

```
app.py             — Streamlit UI and app flow
hebbian.py         — Weight matrix construction, recall logic
patterns.py        — Manually defined 8×8 patterns, conversion helpers
noise.py           — Noise injection and masking functions
visualization.py   — Matplotlib grid-plotting functions
utils.py           — Small helper utilities
tests/
  test_hebbian.py  — Unit tests for core logic
requirements.txt   — Python dependencies
README.md          — This file
```

---

## Possible future improvements

- Add a **custom pattern editor** in the UI (draw your own 8×8 pattern).
- Implement the **Storkey learning rule** for higher capacity.
- Add an **energy landscape** visualisation.
- Implement **pseudo-inverse** (projection) learning for comparison.
- Increase grid size to 10×10 or 16×16 for more detailed patterns.
- Add batch experiments: sweep noise levels and plot recall accuracy curves.
