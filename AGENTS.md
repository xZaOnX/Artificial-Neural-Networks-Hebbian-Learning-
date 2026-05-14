# Agent Guide — Hebbian Pattern Recall

This file is written for AI coding agents. It assumes you know nothing about the project.

---

## Project Overview

This is an **educational demo of autoassociative memory** built with the **Hebbian (outer-product) learning rule** for an Artificial Neural Networks university course.

The system stores 12 hand-crafted 10×10 bipolar patterns (letters, digits, shapes), corrupts them with noise or masking, and recalls the closest learned pattern through iterative network updates. The current primary app is a **Next.js frontend** backed by small **Python Flask JSON APIs**. The Python backend performs the Hebbian memory computation and returns metrics plus Matplotlib-generated visualizations as base64 PNG data URIs.

There are also two legacy/local interfaces that are still maintained but not the primary deployment path:

- `app.py` — original Streamlit UI.
- `server.py` plus `templates/index.html` — standalone Flask-rendered HTML UI.

---

## Technology Stack

| Layer | Technology | Version Notes |
|-------|-----------|---------------|
| Frontend | Next.js (App Router) | ^15.0.0 |
| Frontend | React | ^19.0.0 |
| Frontend | TypeScript | ^5 |
| Frontend | Tailwind CSS | ^3.4 |
| Frontend | PostCSS + Autoprefixer | ^10 |
| Backend | Python | 3.12 (see `.python-version`) |
| Backend | Flask | >=3.0, <4.0 |
| Backend | NumPy | >=1.26, <3.0 |
| Backend | Matplotlib | >=3.8, <4.0 |
| Tests | pytest | install separately if not present |
| Deployment | Vercel | Next.js with Python serverless functions |

---

## Directory Structure

```
app/                      Next.js app router (page.tsx, layout.tsx, globals.css)
components/               React UI components
  hebbian-dashboard.tsx   Main dashboard state + data fetching
  control-panel.tsx       Toolbar with language, mode, sliders, submit
  custom-pattern-editor.tsx  10×10 clickable grid for custom input
  results-panel.tsx       Result images, metrics, tabs
  pattern-gallery.tsx     Collapsible stored-patterns gallery
lib/                      TypeScript utilities
  types.ts                Shared TypeScript interfaces
  copy.ts                 Bilingual UI strings (EN/TR)
api/                      Vercel Python serverless endpoints
  gallery.py              GET /api/gallery
  recall.py               POST /api/recall
tests/                    Python test suite
  test_hebbian.py         Core algorithm tests
  test_api.py             API payload and endpoint tests
  test_server.py          Standalone Flask server tests
templates/                Legacy Flask HTML template (index.html)
hebbian.py                Weight matrix construction and recall logic
patterns.py               Stored 10×10 patterns and conversion helpers
noise.py                  Noise injection and masking functions
visualization.py          Matplotlib visualization helpers
utils.py                  Small metric helpers (accuracy, energy, hamming)
translations.py           Turkish/English UI strings (legacy UIs)
vercel_api.py             Shared gallery/recall API logic used by all endpoints
local_api_server.py       Local Flask JSON API for Next.js development
server.py                 Standalone Flask-rendered HTML UI
app.py                    Legacy Streamlit UI
requirements.txt          Python runtime dependencies
package.json              Node scripts and frontend dependencies
next.config.js            Next.js config (dev API rewrites)
tsconfig.json             TypeScript config
tailwind.config.js        Tailwind CSS config
postcss.config.js         PostCSS config
vercel.json               Vercel deployment configuration
report.md                 University project report
```

---

## Build and Development Commands

### Install dependencies

```bash
# Python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Node
npm install
```

`npm run dev` assumes the virtual environment exists at `./venv`.

### Run locally

```bash
# Start both local Python API and Next.js frontend
npm run dev

# Or run them separately
npm run dev:api     # ./venv/bin/python local_api_server.py  (port 5328)
npm run dev:web     # next dev
```

In development, `next.config.js` rewrites `/api/*` requests to the local Flask API at `http://127.0.0.1:5328`.

### Build for production

```bash
npm run build       # Next.js production build (also validates TypeScript)
```

---

## Testing Instructions

### Python tests

```bash
./venv/bin/python -m pytest tests -q
```

Test files:
- `tests/test_hebbian.py` — patterns, weight matrix symmetry, recall convergence, noise/masking helpers.
- `tests/test_api.py` — gallery payload, stored/custom recall payloads, endpoint routes, input validation.
- `tests/test_server.py` — standalone Flask HTML server rendering and recall submission.

### Frontend validation

```bash
npm run build
```

This verifies TypeScript compilation and Next.js production bundling. There are currently **no automated frontend unit tests**.

---

## Code Style Guidelines

### Python

- Use type hints (`from __future__ import annotations` at the top of files).
- Write docstrings for public functions using **NumPy-style** `Parameters` / `Returns` sections (see `hebbian.py` for examples).
- Prefer `np.random.default_rng()` over global `np.random` state.
- Use `snake_case` for functions and variables, `PascalCase` for classes, `UPPER_CASE` for module-level constants.
- Keep Matplotlib figures as objects; do not rely on the global pyplot state in shared/API code. Always call `plt.close(fig)` or `matplotlib.pyplot.close(fig)` after saving to a buffer.
- Set `matplotlib.use("Agg")` before importing `pyplot` in serverless/server contexts.
- For serverless environments, set `MPLCONFIGDIR` and `XDG_CACHE_HOME` to `/tmp` before importing Matplotlib.

### TypeScript / React

- Strict TypeScript is enabled (`strict: true` in `tsconfig.json`).
- Use functional components with explicit prop interfaces.
- Prefer `useDeferredValue` and `useTransition` for language switches to avoid blocking the UI.
- All API calls are plain `fetch`; no external HTTP library is used.
- Tailwind utility classes are used for layout; custom component classes live in `app/globals.css` under `@layer components`.
- CSS custom properties (variables) are defined in `:root` in `globals.css` and referenced as `rgb(var(--name))`.

---

## API Contract

### `GET /api/gallery?lang=en|tr`

Returns stored-pattern metadata and a base64 gallery image.

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

For custom input, set `input_mode` to `"custom"` and provide `custom_pattern` as a flat 100-cell array. Positive values map to `+1`; zero and negative values map to `-1`.

All images in responses are returned as `data:image/png;base64,...` data URIs.

---

## Deployment

The project is configured for **Vercel**:

- `vercel.json` sets `"framework": "nextjs"`.
- `api/gallery.py` and `api/recall.py` serve as Python serverless functions.
- `vercel_api.py` contains shared API logic used by both endpoints.
- `vercel.json` excludes `tests/`, `templates/`, `__pycache__/`, `venv/`, `.venv/`, `server.py`, and `app.py` from the function bundles.

`server.py` is still useful as a standalone Flask-rendered UI, but it is **not** the current Vercel entrypoint.

---

## Security Considerations

- **Input validation:** All API inputs are normalized and clamped to safe ranges in `vercel_api.py` (`_clamp_float`, `_clamp_int`, `_normalize_lang`, etc.). Invalid values fall back to defaults; they do not raise errors for most fields.
- **Custom pattern validation:** `custom_pattern` length is strictly checked against `N_NEURONS` (100). Non-numeric or nested values are rejected with `ValueError`.
- **Serverless filesystem:** Matplotlib cache and config directories are redirected to `/tmp` to avoid read-only filesystem issues in serverless environments.
- **No secrets:** There are no API keys, database credentials, or `.env` secrets in this project. Do not add any.

---

## Important Implementation Notes

- **Grid size:** All patterns are fixed at `GRID_SIZE = 10` (100 neurons). Many arrays and UI grids hard-code this size. Changing it requires updating `patterns.py`, the pattern catalog, and the frontend assumptions.
- **Weight matrix:** The Hebbian weight matrix is computed once at import time in `vercel_api.py` and `server.py` (module-level `WEIGHT_MATRIX`). It is shared across requests.
- **Bilingual support:** UI strings exist in two places:
  - `lib/copy.ts` for the Next.js frontend.
  - `translations.py` for the legacy Python UIs (Streamlit + Flask HTML).
  If you add new UI copy, update **both** files to keep parity.
- **Matplotlib backend:** Never use a GUI backend in API code. Always import `matplotlib` first, call `matplotlib.use("Agg")`, then import `pyplot`.
- **Capacity limit:** The network stores 12 patterns in 100 neurons. The theoretical Hebbian capacity is ~14 patterns. Operating near capacity means some patterns may not be perfectly stable and spurious attractors can occur. This is intentional educational behavior.
