# Interactive Noisy Pattern Recall Using Hebbian Learning

An educational demo of **autoassociative memory** built with the **Hebbian (outer-product) learning rule**. The system stores 12 hand-crafted 10x10 bipolar patterns (letters, digits, shapes), corrupts stored patterns with noise or masking, and recalls the closest learned pattern through iterative network updates.

The current app is a **Next.js frontend** backed by small **Python Flask JSON APIs**. The Python backend performs the Hebbian memory computation and returns metrics plus Matplotlib-generated visualizations.

---

## Project goal

Demonstrate how a simple neural network can act as a **content-addressable memory**: given a partial or noisy version of a stored pattern, the network reconstructs the full original. The project is designed for an Artificial Neural Networks university course.

---

## How it works

### 1. Hebbian autoassociative memory

Each pattern is a vector of bipolar values `{-1, +1}` with 100 elements for a 10x10 grid. Storage uses the **Hebb rule**: the weight matrix is the normalized sum of outer products of all stored patterns:

```text
W = (1/N) Σᵢ xᵢ xᵢᵀ
```

The diagonal of `W` is set to zero to prevent self-reinforcement.

### 2. Recall

Given a noisy input `s`, the network iteratively updates:

```text
s(t+1) = sign(W · s(t))
```

until convergence or until the configured maximum step count is reached. Two update modes are available:

- **Synchronous**: all neurons update at once each step.
- **Asynchronous**: neurons update one at a time in random order, using the latest state immediately.

### 3. Noise and masking

- **Noise**: randomly flips a fraction of cells (`+1 <-> -1`).
- **Masking**: zeroes out a fraction of cells to represent missing data.

Both can be combined. The network uses correlations in the weight matrix to reconstruct the original pattern.

### 4. Capacity and limitations

A network of `N` neurons can reliably store approximately **0.14 x N** patterns. For this project, `N = 100`, so the approximate capacity is 14 patterns. With 12 stored patterns, the network operates close to that limit, so you may observe:

- **Interference**: similar patterns may confuse the network.
- **Spurious attractors**: the network may converge to a state that was never stored.
- **Partial recall**: the recalled pattern may be a mixture of stored patterns.

These failure modes are educational: they illustrate fundamental limits of Hopfield / Hebbian networks.

---

## Stored patterns

| Letters | Digits | Shapes   |
|---------|--------|----------|
| A E H X | 0 1 2  | square   |
|         | 3 8    | triangle |
|         |        | plus     |

All patterns are defined in `patterns.py`.

---

## Current architecture

```text
Next.js UI
  app/page.tsx
  components/hebbian-dashboard.tsx
  components/control-panel.tsx
  components/custom-pattern-editor.tsx
  components/results-panel.tsx
  components/pattern-gallery.tsx

Python API / computation
  api/gallery.py          GET /api/gallery
  api/recall.py           POST /api/recall
  local_api_server.py     local Flask API used during development
  vercel_api.py           shared API payload and recall logic
  hebbian.py              weight matrix construction and recall rules
  patterns.py             stored 10x10 patterns
  noise.py                noise and masking helpers
  visualization.py        Matplotlib plots returned as base64 PNG data URIs
  utils.py                metrics such as accuracy and energy
```

There are also two legacy/local interfaces:

- `app.py`: original Streamlit UI.
- `server.py` plus `templates/index.html`: standalone Flask-rendered HTML UI.

The primary app path is now the Next.js frontend with Python JSON API endpoints.

---

## Installation

Install Python dependencies:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Install Node dependencies:

```bash
npm install
```

`npm run dev` assumes the virtual environment exists at `./venv`.

---

## Running the app locally

Start the local Python API and Next.js frontend together:

```bash
npm run dev
```

This runs:

- `local_api_server.py` on `http://127.0.0.1:5328`
- `next dev` for the frontend

In development, `next.config.js` rewrites `/api/*` requests to the local Flask API.

You can also run the two processes separately:

```bash
npm run dev:api
npm run dev:web
```

---

## Using the app

1. Choose **Stored Pattern** or **Draw Custom**.
2. For stored patterns, select a pattern and set noise/masking values.
3. Choose synchronous or asynchronous recall.
4. Set max steps, activation threshold, and random seed.
5. Click **Run Recall**.
6. Review the comparison image, accuracy, bit errors, overlap, nearest stored pattern, recall trajectory, and overlap chart.

---

## API endpoints

### `GET /api/gallery`

Returns stored-pattern metadata and a base64 gallery image.

Optional query parameter:

- `lang`: `en` or `tr`

### `POST /api/recall`

Runs recall and returns metrics plus visualization images.

Example payload:

```json
{
  "lang": "en",
  "input_mode": "stored",
  "pattern": "A",
  "noise_level": 0.2,
  "mask_ratio": 0,
  "update_mode": "synchronous",
  "steps": 10,
  "threshold": 0,
  "seed": 42
}
```

For custom input, set `input_mode` to `custom` and provide `custom_pattern` as a flat 100-cell array. Positive values map to `+1`; zero and negative values map to `-1`.

---

## Vercel deployment

The project is configured as a Next.js app with Python serverless functions:

- `vercel.json` sets `"framework": "nextjs"`.
- `api/gallery.py` serves the gallery endpoint.
- `api/recall.py` serves the recall endpoint.
- `vercel_api.py` contains shared API logic used by both endpoints.

`server.py` is still useful as a standalone Flask-rendered UI, but it is not the current Vercel entrypoint.

---

## Running tests

The current `requirements.txt` contains runtime dependencies. If `pytest` is not already installed in your virtual environment, install it before running the Python tests.

```bash
./venv/bin/python -m pytest tests -q
npm run build
```

The Python tests cover the Hebbian core, corruption helpers, API helpers, local API routes, and the standalone Flask HTML route. The Next.js build verifies TypeScript and production compilation.

---

## Project structure

```text
app/                  Next.js app router files
components/           React UI components
lib/                  TypeScript copy and response types
api/                  Vercel Python serverless endpoints
templates/            Legacy Flask HTML template
tests/                Python test suite
app.py                Legacy Streamlit UI
server.py             Standalone Flask-rendered HTML UI
local_api_server.py   Local Flask JSON API for Next.js development
vercel_api.py         Shared gallery and recall API logic
hebbian.py            Weight matrix construction and recall logic
patterns.py           Stored 10x10 patterns and conversion helpers
noise.py              Noise injection and masking functions
visualization.py      Matplotlib visualization helpers
utils.py              Small metric helpers
requirements.txt      Python runtime dependencies
package.json          Node scripts and frontend dependencies
vercel.json           Vercel deployment configuration
```

---

## Possible future improvements

- Add automated frontend tests for the dashboard flow.
- Add batch experiments that sweep noise levels and plot recall accuracy curves.
- Add an energy landscape visualization.
- Implement the Storkey learning rule for higher capacity.
- Implement pseudo-inverse projection learning for comparison.
- Increase grid size to 16x16 for more detailed patterns.
