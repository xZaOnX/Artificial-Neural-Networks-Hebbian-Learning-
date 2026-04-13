"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";

import { ControlPanel } from "@/components/control-panel";
import { PatternGallery } from "@/components/pattern-gallery";
import { ResultsPanel } from "@/components/results-panel";
import { COPY } from "@/lib/copy";
import { GalleryResponse, InputMode, Lang, RecallResponse, UpdateMode } from "@/lib/types";

const DEFAULT_GRID_SIZE = 10;

function createPattern(length: number, value: 1 | -1) {
  return Array.from({ length }, () => value);
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const body = (await response.text()).trim();
    const snippet = body.slice(0, 160) || `HTTP ${response.status}`;
    throw new Error(snippet);
  }

  return (await response.json()) as T;
}

export function HebbianDashboard() {
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
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error && error.message ? error.message : deferredCopy.galleryError;
        setGalleryError(message);
      } finally {
        if (!controller.signal.aborted) {
          setGalleryLoading(false);
        }
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
        headers: {
          "Content-Type": "application/json",
        },
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
      const message = error instanceof Error && error.message ? error.message : copy.recallError;
      setRecallError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLangChange(nextLang: Lang) {
    startTransition(() => {
      setLang(nextLang);
    });

    if (result) {
      void submitRecall(nextLang);
    }
  }

  function handleInputModeChange(nextMode: InputMode) {
    startTransition(() => {
      setInputMode(nextMode);
    });
  }

  function handleSetCustomCell(index: number, value: 1 | -1) {
    setCustomPattern((current) => {
      if (current[index] === value) {
        return current;
      }

      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="panel overflow-hidden">
        <div className="panel-body space-y-4">
          <div className="inline-flex w-fit items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd166]">
            {copy.subtitle}
          </div>
          <div className="max-w-4xl space-y-4">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.06em] text-[rgb(var(--text-primary))] sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[rgb(var(--text-secondary))] sm:text-base">
              {copy.description}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
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

        <ResultsPanel
          copy={copy}
          result={result}
          isSubmitting={isSubmitting}
          error={recallError}
        />
      </div>

      <PatternGallery
        copy={copy}
        gallery={gallery}
        isLoading={galleryLoading}
        error={galleryError}
      />

      <section className="panel">
        <div className="panel-body space-y-5">
          <div>
            <p className="section-label">{copy.howItWorks}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              {copy.howItWorks}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {copy.explanation.map((paragraph) => (
              <div
                key={paragraph}
                className="rounded-[24px] border border-white/10 bg-black/15 p-5 text-sm leading-7 text-[rgb(var(--text-secondary))]"
              >
                {paragraph}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
