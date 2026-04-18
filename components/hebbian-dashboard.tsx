"use client";

import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";

import { ControlPanel } from "@/components/control-panel";
import { PatternGallery } from "@/components/pattern-gallery";
import { ResultsPanel } from "@/components/results-panel";
import { COPY } from "@/lib/copy";
import { GalleryResponse, InputMode, Lang, RecallResponse, UpdateMode } from "@/lib/types";

const DEFAULT_GRID_SIZE = 10;

function createPattern(length: number, value: 1 | -1) {
  return Array.from({ length }, () => value);
}

function formatRatio(value: number) {
  return value.toFixed(2);
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const body = (await response.text()).trim();
    throw new Error(body.slice(0, 160) || `HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export function HebbianDashboard() {
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [inputMode, setInputMode] = useState<InputMode>("stored");
  const [selectedPattern, setSelectedPattern] = useState("");
  const [noiseLevel, setNoiseLevel] = useState(0.15);
  const [maskRatio, setMaskRatio] = useState(0);
  const [updateMode, setUpdateMode] = useState<UpdateMode>("synchronous");
  const [steps, setSteps] = useState(10);
  const [threshold, setThreshold] = useState(0);
  const [seed, setSeed] = useState(42);
  const [customPattern, setCustomPattern] = useState<number[]>(
    createPattern(DEFAULT_GRID_SIZE * DEFAULT_GRID_SIZE, -1),
  );
  const [gallery, setGallery] = useState<GalleryResponse | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [result, setResult] = useState<RecallResponse | null>(null);
  const [recallError, setRecallError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, startTransition] = useTransition();
  const deferredLang = useDeferredValue(lang);

  const copy = COPY[lang];
  const deferredCopy = COPY[deferredLang];
  const gridSize = gallery?.gridSize ?? DEFAULT_GRID_SIZE;
  const isBusy = isSubmitting || isTransitioning;

  useEffect(() => {
    const controller = new AbortController();
    async function loadGallery() {
      setGalleryLoading(true);
      setGalleryError(null);
      try {
        const response = await fetch(`/api/gallery?lang=${deferredLang}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          const payload = await readJsonResponse<{ error?: string }>(response);
          throw new Error(payload.error || deferredCopy.galleryError);
        }
        const payload = await readJsonResponse<GalleryResponse>(response);
        setGallery(payload);
        setSelectedPattern((current) =>
          payload.patternNames.includes(current) ? current : payload.defaultPattern,
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error && error.message ? error.message : deferredCopy.galleryError;
        setGalleryError(message);
      } finally {
        if (!controller.signal.aborted) setGalleryLoading(false);
      }
    }
    void loadGallery();
    return () => controller.abort();
  }, [deferredCopy.galleryError, deferredLang]);

  useEffect(() => {
    const nextLength = gridSize * gridSize;
    setCustomPattern((current) =>
      current.length === nextLength ? current : createPattern(nextLength, -1),
    );
  }, [gridSize]);

  async function submitRecall(nextLang?: Lang) {
    setIsSubmitting(true);
    setRecallError(null);
    try {
      const response = await fetch("/api/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: nextLang ?? lang,
          input_mode: inputMode,
          pattern: selectedPattern,
          custom_pattern: customPattern,
          noise_level: noiseLevel,
          mask_ratio: maskRatio,
          update_mode: updateMode,
          steps,
          threshold,
          seed,
        }),
      });
      const payload = await readJsonResponse<RecallResponse | { error?: string }>(response);
      if (!response.ok) {
        throw new Error(payload && "error" in payload && payload.error ? payload.error : copy.recallError);
      }
      setResult(payload as RecallResponse);
    } catch (error) {
      setRecallError(error instanceof Error && error.message ? error.message : copy.recallError);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLangChange(nextLang: Lang) {
    startTransition(() => setLang(nextLang));
    if (result) void submitRecall(nextLang);
  }

  function handleInputModeChange(nextMode: InputMode) {
    startTransition(() => setInputMode(nextMode));
  }

  function handleSetCustomCell(index: number, value: 1 | -1) {
    setCustomPattern((current) => {
      if (current[index] === value) return current;
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  return (
    <div className="flex min-h-screen flex-col">

      {/* Slim title bar */}
      <div
        className="flex items-center border-b px-6 py-3"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
          Hebbian Pattern Recall
        </span>
        <span className="ml-3 text-xs text-[rgb(var(--text-muted))]">
          10×10 · {copy.subtitle}
        </span>
      </div>

      {/* Horizontal controls bar */}
      <ControlPanel
        copy={copy}
        lang={lang}
        inputMode={inputMode}
        selectedPattern={selectedPattern}
        patternNames={gallery?.patternNames ?? []}
        gridSize={gridSize}
        customPattern={customPattern}
        noiseLevel={noiseLevel}
        maskRatio={maskRatio}
        updateMode={updateMode}
        steps={steps}
        threshold={threshold}
        seed={seed}
        isBusy={isBusy}
        onLangChange={handleLangChange}
        onInputModeChange={handleInputModeChange}
        onPatternChange={setSelectedPattern}
        onNoiseLevelChange={setNoiseLevel}
        onMaskRatioChange={setMaskRatio}
        onUpdateModeChange={setUpdateMode}
        onStepsChange={setSteps}
        onThresholdChange={setThreshold}
        onSeedChange={setSeed}
        onSetCustomCell={handleSetCustomCell}
        onClearCustomPattern={() => setCustomPattern(createPattern(gridSize * gridSize, -1))}
        onFillCustomPattern={() => setCustomPattern(createPattern(gridSize * gridSize, 1))}
        onSubmit={() => void submitRecall()}
      />

      {/* Results — full width */}
      <div ref={resultsRef} className="flex-1">
        <ResultsPanel
          copy={copy}
          result={result}
          isSubmitting={isSubmitting}
          error={recallError}
        />
      </div>

      {/* Pattern gallery */}
      <div className="border-t" style={{ borderColor: "rgb(var(--border))" }}>
        <PatternGallery
          copy={copy}
          gallery={gallery}
          isLoading={galleryLoading}
          error={galleryError}
        />
      </div>

      {/* How it works */}
      <div className="border-t px-6 py-8 sm:px-10" style={{ borderColor: "rgb(var(--border))" }}>
        <p className="section-label mb-6">{copy.howItWorks}</p>
        <div className="grid gap-8 lg:grid-cols-3">
          {copy.explanation.map((paragraph, index) => (
            <div key={paragraph}>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="text-sm leading-6 text-[rgb(var(--text-secondary))]">{paragraph}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
