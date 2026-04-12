"""
translations.py — Turkish / English UI strings for the Streamlit app.
"""

TRANSLATIONS = {
    "en": {
        # Page
        "page_title": "Hebbian Pattern Recall",
        "title": "Hebbian Pattern Recall",
        "subtitle": "Interactive Noisy Pattern Recall Using Hebbian Learning",
        "description": (
            "This system stores **10x10 bipolar patterns** in a Hopfield-style "
            "autoassociative memory using the **Hebbian learning rule**. Corrupt "
            "any stored pattern with noise or masking, then observe the network "
            "reconstruct the original through iterative recall."
        ),
        # Sidebar
        "language": "Language",
        "controls": "Controls",
        "pattern": "Pattern",
        "corruption": "Corruption",
        "noise_level": "Noise level",
        "noise_help": "Fraction of cells randomly flipped",
        "mask_ratio": "Masking ratio",
        "mask_help": "Fraction of cells zeroed out (unknown)",
        "recall_settings": "Recall",
        "update_mode": "Update mode",
        "synchronous": "Synchronous",
        "asynchronous": "Asynchronous",
        "max_recall_steps": "Max steps",
        "activation_threshold": "Threshold",
        "random_seed": "Seed",
        "run_recall": "Run Recall",
        "running": "Running recall...",
        # Stored patterns
        "view_all_patterns": "Stored Patterns",
        "stored_patterns_title": "Stored patterns",
        "pattern_count": "{n} patterns stored in {neurons}-neuron network (capacity ~{cap})",
        "parameter_notice": "Some values were reset to safe defaults.",
        # Results
        "result": "Recall Result",
        "accuracy": "Accuracy",
        "errors": "Bit Errors",
        "overlap": "Overlap",
        "nearest_pattern": "Nearest",
        "match_label": "Match",
        "converged_label": "Converged in {steps} step(s)",
        "energy_label": "Energy: {energy:.2f}",
        "success": "Correct recall",
        "failure": "Recall failed",
        # Plots
        "original": "Original",
        "corrupted": "Corrupted",
        "recalled": "Recalled",
        "pattern_label": "Pattern: {name}",
        "step": "t={i}",
        "recall_trajectory_title": "Recall trajectory",
        # Expanders
        "recall_trajectory": "Recall Trajectory",
        "overlap_all": "Overlap with All Patterns",
        "how_it_works": "How It Works",
        "explanation": r"""
**Hebbian autoassociative memory** stores patterns as stable attractors
of a recurrent neural network.

1. **Storage** — Each pattern $\mathbf{x}_i$ (a bipolar vector of $\{-1,+1\}$)
   is stored by adding its outer product to a shared weight matrix:

$$W = \frac{1}{N}\sum_{i=1}^{p} \mathbf{x}_i \mathbf{x}_i^T$$

   The diagonal is set to zero to prevent self-reinforcement.

2. **Recall** — Given a noisy probe $\mathbf{s}^{(0)}$, the network
   iteratively updates:

$$\mathbf{s}^{(t+1)} = \text{sign}\!\left(W\,\mathbf{s}^{(t)}\right)$$

   until the state converges.  The final state is the **recalled pattern**.

3. **Capacity** — A network of $N$ neurons can reliably store about
   $0.14\,N$ patterns.  Beyond that, interference between stored
   memories causes recall errors (*spurious attractors*).

**Noise** flips random cells; **masking** zeroes them out (unknown).
The network fills in missing information using correlations captured
in the weight matrix.
""",
    },
    "tr": {
        # Sayfa
        "page_title": "Hebbian Oruntu Hatirlama",
        "title": "Hebbian Oruntu Hatirlama",
        "subtitle": "Hebbian Ogrenme ile Etkilesimli Gurultulu Oruntu Hatirlama",
        "description": (
            "Bu sistem, **Hebbian ogrenme kurali** ile olusturulmus bir Hopfield tipi "
            "otocagrisimli bellekte **10x10 bipolar oruntuleri** saklar. Saklanan herhangi "
            "bir oruntuyu gurultu veya maskeleme ile bozabilir, ardindan agin iteratif "
            "guncellemelerle orijinali yeniden olusturmasini gozlemleyebilirsiniz."
        ),
        # Kenar cubugu
        "language": "Dil",
        "controls": "Kontroller",
        "pattern": "Oruntu",
        "corruption": "Bozma",
        "noise_level": "Gurultu seviyesi",
        "noise_help": "Rastgele cevrilen hucre orani",
        "mask_ratio": "Maskeleme orani",
        "mask_help": "Sifirlanan (bilinmeyen) hucre orani",
        "recall_settings": "Hatirlama",
        "update_mode": "Guncelleme modu",
        "synchronous": "Eszamanli",
        "asynchronous": "Eszamansiz",
        "max_recall_steps": "Maks adim",
        "activation_threshold": "Esik",
        "random_seed": "Tohum",
        "run_recall": "Hatirla",
        "running": "Hatirlama calisiyor...",
        # Sakli oruntüler
        "view_all_patterns": "Sakli Oruntuler",
        "stored_patterns_title": "Sakli oruntuler",
        "pattern_count": "{neurons} noronlu agda {n} oruntu sakli (kapasite ~{cap})",
        "parameter_notice": "Bazi alanlar guvenli varsayilanlara sifirlandi.",
        # Sonuclar
        "result": "Hatirlama Sonucu",
        "accuracy": "Dogruluk",
        "errors": "Bit Hatasi",
        "overlap": "Ortusme",
        "nearest_pattern": "En Yakin",
        "match_label": "Eslesme",
        "converged_label": "{steps} adimda yakinsadi",
        "energy_label": "Enerji: {energy:.2f}",
        "success": "Dogru hatirlama",
        "failure": "Hatirlama basarisiz",
        # Grafikler
        "original": "Orijinal",
        "corrupted": "Bozulmus",
        "recalled": "Hatirlanan",
        "pattern_label": "Oruntu: {name}",
        "step": "t={i}",
        "recall_trajectory_title": "Hatirlama yorungesi",
        # Genisletilebilir bolumler
        "recall_trajectory": "Hatirlama Yorungesi",
        "overlap_all": "Tum Oruntulerle Ortusme",
        "how_it_works": "Nasil Calisiyor?",
        "explanation": r"""
**Hebbian otocagrisimli bellek**, oruntuleri tekrarlayan bir sinir aginin
kararli cekicileri (attractor) olarak saklar.

1. **Saklama** — Her oruntu $\mathbf{x}_i$ ($\{-1,+1\}$ degerlerinden olusan
   bipolar bir vektor) dis carpimi agirlik matrisine eklenerek saklanir:

$$W = \frac{1}{N}\sum_{i=1}^{p} \mathbf{x}_i \mathbf{x}_i^T$$

   Diyagonal, kendini guclendirmeyi onlemek icin sifirlanir.

2. **Hatirlama** — Gurultulu bir girdi $\mathbf{s}^{(0)}$ verildiginde, ag
   iteratif olarak guncellenir:

$$\mathbf{s}^{(t+1)} = \text{sign}\!\left(W\,\mathbf{s}^{(t)}\right)$$

   Durum yakinsayana kadar devam eder. Son durum **hatirlanan oruntudur**.

3. **Kapasite** — $N$ noronlu bir ag yaklasik $0.14\,N$ oruntuyu guvenilir
   sekilde saklayabilir. Bu sinir asildiginda, saklanan bellekler arasindaki
   girisim hatirlama hatalarina (*sahte cekiciler*) neden olur.

**Gurultu** rastgele hucreleri cevirir; **maskeleme** onlari sifirlar (bilinmeyen).
Ag, agirlik matrisinde yakalanan korelasyonlari kullanarak eksik bilgiyi tamamlar.
""",
    },
}


def t(key: str, lang: str = "en", **kwargs) -> str:
    """Look up a translated string and format it with kwargs if provided."""
    text = TRANSLATIONS[lang][key]
    if kwargs:
        return text.format(**kwargs)
    return text
