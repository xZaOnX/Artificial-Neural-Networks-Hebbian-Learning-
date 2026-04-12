"""
app.py — Streamlit interactive interface for Hebbian associative memory.

Run with:
    streamlit run app.py
"""

import numpy as np
import streamlit as st

from patterns import get_all_patterns, get_pattern_matrix, GRID_SIZE
from hebbian import (
    build_weight_matrix,
    recall_synchronous,
    recall_asynchronous,
    overlap,
    find_nearest_pattern,
    count_errors,
)
from noise import corrupt
from visualization import (
    plot_comparison,
    plot_recall_history,
    plot_all_stored_patterns,
    plot_overlap_bars,
)
from utils import accuracy, energy
from translations import t

# ───────────────────────────────────────────────────────────────────
# Page config & custom CSS
# ───────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Hebbian Pattern Recall",
    page_icon="~",
    layout="wide",
)

st.markdown("""
<style>
    /* ── Global ── */
    .block-container { padding-top: 2rem; padding-bottom: 2rem; }

    /* ── Header area ── */
    .hero-title {
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 0.15rem;
        color: #f1f5f9;
    }
    .hero-subtitle {
        font-size: 0.95rem;
        color: #94a3b8;
        margin-bottom: 1.2rem;
        line-height: 1.5;
    }

    /* ── Metric cards ── */
    div[data-testid="stMetric"] {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 14px 18px;
    }
    div[data-testid="stMetric"] label {
        color: #94a3b8 !important;
        font-size: 0.78rem !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    div[data-testid="stMetric"] [data-testid="stMetricValue"] {
        font-size: 1.55rem !important;
        font-weight: 700 !important;
        color: #f8fafc !important;
    }

    /* ── Status badge ── */
    .badge {
        display: inline-block;
        padding: 4px 14px;
        border-radius: 20px;
        font-size: 0.82rem;
        font-weight: 600;
        letter-spacing: 0.02em;
    }
    .badge-success { background: #065f46; color: #6ee7b7; }
    .badge-fail    { background: #7f1d1d; color: #fca5a5; }

    /* ── Section labels ── */
    .section-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        margin-bottom: 0.4rem;
        font-weight: 600;
    }

    /* ── Sidebar ── */
    section[data-testid="stSidebar"] {
        background: #0f172a;
    }
    section[data-testid="stSidebar"] .stRadio > label {
        font-size: 0.85rem;
    }

    /* ── Divider ── */
    .soft-divider {
        border: none;
        border-top: 1px solid #1e293b;
        margin: 1.5rem 0;
    }
</style>
""", unsafe_allow_html=True)

# ───────────────────────────────────────────────────────────────────
# Sidebar
# ───────────────────────────────────────────────────────────────────
with st.sidebar:
    lang_toggle = st.toggle("TR / EN", value=False)
    lang = "tr" if lang_toggle else "en"

    st.markdown("---")

    # ── Pattern selection ──
    all_patterns = get_all_patterns()
    P, pattern_names = get_pattern_matrix()
    W = build_weight_matrix(P, zero_diagonal=True)
    N = GRID_SIZE * GRID_SIZE

    selected_name = st.selectbox(t("pattern", lang), pattern_names)

    st.markdown("---")

    # ── Corruption ──
    st.markdown(f'<p class="section-label">{t("corruption", lang)}</p>',
                unsafe_allow_html=True)
    noise_level = st.slider(t("noise_level", lang), 0.0, 1.0, 0.15, 0.05,
                            help=t("noise_help", lang))
    mask_ratio = st.slider(t("mask_ratio", lang), 0.0, 1.0, 0.0, 0.05,
                           help=t("mask_help", lang))

    st.markdown("---")

    # ── Recall settings ──
    st.markdown(f'<p class="section-label">{t("recall_settings", lang)}</p>',
                unsafe_allow_html=True)
    mode_options = [t("synchronous", lang), t("asynchronous", lang)]
    update_mode = st.radio(t("update_mode", lang), mode_options,
                           horizontal=True)
    c1, c2 = st.columns(2)
    recall_steps = c1.slider(t("max_recall_steps", lang), 1, 50, 10)
    threshold = c2.slider(t("activation_threshold", lang), 0.0, 1.0, 0.0, 0.05)

    seed = st.number_input(t("random_seed", lang), value=42, step=1)

    st.markdown("---")
    run_button = st.button(t("run_recall", lang), type="primary",
                           use_container_width=True)

# ───────────────────────────────────────────────────────────────────
# Hero header
# ───────────────────────────────────────────────────────────────────
st.markdown(f'<div class="hero-title">{t("title", lang)}</div>',
            unsafe_allow_html=True)
st.markdown(f'<div class="hero-subtitle">{t("description", lang)}</div>',
            unsafe_allow_html=True)

# ───────────────────────────────────────────────────────────────────
# Stored patterns gallery
# ───────────────────────────────────────────────────────────────────
with st.expander(t("view_all_patterns", lang), expanded=False):
    st.caption(t("pattern_count", lang, n=len(pattern_names),
                 neurons=N, cap=int(0.14 * N)))
    fig_all = plot_all_stored_patterns(all_patterns, lang=lang)
    st.pyplot(fig_all, use_container_width=True)

# ───────────────────────────────────────────────────────────────────
# Main recall
# ───────────────────────────────────────────────────────────────────
if run_button:
    rng = np.random.default_rng(int(seed))
    original = all_patterns[selected_name]
    corrupted = corrupt(original, noise_level, mask_ratio, rng)

    if update_mode == mode_options[0]:
        recalled, history = recall_synchronous(W, corrupted, recall_steps, threshold)
    else:
        recalled, history = recall_asynchronous(W, corrupted, recall_steps, threshold, rng)

    # Compute metrics
    nearest_name, nearest_ovlp = find_nearest_pattern(recalled, P, pattern_names)
    n_errors = count_errors(original, recalled)
    acc = accuracy(original, recalled)
    e = energy(W, recalled)
    ovlp = overlap(original, recalled)
    is_correct = nearest_name == selected_name

    st.markdown('<hr class="soft-divider">', unsafe_allow_html=True)

    # ── Result header with badge ────────────────────────────────
    badge_class = "badge-success" if is_correct else "badge-fail"
    badge_text = t("success", lang) if is_correct else t("failure", lang)
    st.markdown(
        f'### {t("result", lang)} &nbsp;'
        f'<span class="badge {badge_class}">{badge_text}</span>',
        unsafe_allow_html=True,
    )

    # ── Side-by-side comparison ─────────────────────────────────
    fig_cmp = plot_comparison(original, corrupted, recalled,
                              selected_name, lang=lang)
    st.pyplot(fig_cmp, use_container_width=True)

    # ── Metrics row ─────────────────────────────────────────────
    col1, col2, col3, col4 = st.columns(4)
    col1.metric(t("accuracy", lang), f"{acc:.1%}")
    col2.metric(t("errors", lang), f"{n_errors} / {N}")
    col3.metric(t("overlap", lang), f"{ovlp:.3f}")
    col4.metric(t("nearest_pattern", lang), nearest_name)

    # ── Extra info line ─────────────────────────────────────────
    info_parts = [
        t("converged_label", lang, steps=len(history) - 1),
        t("energy_label", lang, energy=e),
    ]
    st.caption(" &nbsp;&middot;&nbsp; ".join(info_parts))

    st.markdown('<hr class="soft-divider">', unsafe_allow_html=True)

    # ── Detailed views in tabs ──────────────────────────────────
    tab_traj, tab_overlap = st.tabs([
        t("recall_trajectory", lang),
        t("overlap_all", lang),
    ])

    with tab_traj:
        fig_hist = plot_recall_history(history, lang=lang)
        st.pyplot(fig_hist, use_container_width=True)

    with tab_overlap:
        overlaps = {
            name: round(overlap(recalled, all_patterns[name]), 4)
            for name in pattern_names
        }
        fig_bars = plot_overlap_bars(overlaps, highlight=nearest_name, lang=lang)
        st.pyplot(fig_bars, use_container_width=True)

else:
    # ── Empty state ─────────────────────────────────────────────
    st.markdown('<hr class="soft-divider">', unsafe_allow_html=True)
    st.markdown(
        f'<div style="text-align:center; padding:3rem 0; color:#475569;">'
        f'<div style="font-size:2.5rem; margin-bottom:0.5rem;">~</div>'
        f'<div>{t("run_recall", lang)}</div></div>',
        unsafe_allow_html=True,
    )

# ───────────────────────────────────────────────────────────────────
# Theory section
# ───────────────────────────────────────────────────────────────────
st.markdown('<hr class="soft-divider">', unsafe_allow_html=True)
with st.expander(t("how_it_works", lang)):
    st.markdown(t("explanation", lang))
