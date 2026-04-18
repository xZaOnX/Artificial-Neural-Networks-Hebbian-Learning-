# Interactive Noisy Pattern Recall Using Hebbian Learning

An educational demo of **autoassociative memory** built with the **Hebbian (outer-product) learning rule**. The system stores 13 hand-crafted 10×10 bipolar patterns (letters, digits, shapes), corrupts them with noise or masking, and recalls the original pattern through iterative network updates — all exposed through an interactive Streamlit interface.

---

## Project goal

Demonstrate how a simple neural network can act as a **content-addressable memory**: given a partial or noisy version of a stored pattern, the network reconstructs the full original. The project is designed for an Artificial Neural Networks university course.

---

## How it works

### 1. Hebbian autoassociative memory

Each pattern is a vector of bipolar values {-1, +1} (100 elements for a 10×10 grid). Storage uses the **Hebb rule**: the weight matrix is the (normalised) sum of outer products of all stored patterns:

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

A network of N neurons can reliably store approximately **0.14 × N** patterns (about 14 for N=100). With 13 stored patterns we operate right at this limit, so you may observe:

- **Interference** — similar patterns may confuse the network.
- **Spurious attractors** — the network may converge to a state that was never stored.
- **Partial recall** — the recalled pattern may be a mixture of stored patterns.

These failure modes are **educational** — they illustrate fundamental limits of Hopfield / Hebbian networks.

---

## Stored patterns

| Letters | Digits | Shapes   |
|---------|--------|----------|
| A E H X | 0 1 2  | square   |
|         | 3 8    | triangle |
|         |        | plus     |

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

## Vercel deployment

This repo now includes a Vercel-compatible Flask entrypoint in `server.py`.
The original Streamlit interface in `app.py` is still the local-first UI, but
Vercel uses the Flask app because it supports WSGI-style Python deployments.

```bash
# Preview the Vercel entrypoint locally
python -m flask --app server run
```

Deployment notes:

- `pyproject.toml` points Vercel at `server:app`.
- `server.py` exports the Flask `app` used by Vercel.
- `requirements.txt` includes `Flask` alongside the existing scientific stack.

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
patterns.py        — Manually defined 10×10 patterns, conversion helpers
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

- Add a **custom pattern editor** in the UI (draw your own 10×10 pattern).
- Implement the **Storkey learning rule** for higher capacity.
- Add an **energy landscape** visualisation.
- Implement **pseudo-inverse** (projection) learning for comparison.
- Increase grid size to 16×16 for more detailed patterns.
- Add batch experiments: sweep noise levels and plot recall accuracy curves.
