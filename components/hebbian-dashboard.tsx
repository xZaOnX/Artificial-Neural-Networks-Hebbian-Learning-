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
    const snippet = body.slice(0, 160) || `HTTP ${response.status}`;
    throw new Error(snippet);
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
  const corruptionSummary = inputMode === "stored" ? formatRatio(noiseLevel) : "--";
  const maskingSummary = inputMode === "stored" ? formatRatio(maskRatio) : "--";
  const summaryItems = [
    {
      label: copy.inputMode,
      value: inputMode === "stored" ? copy.storedPattern : copy.drawCustom,
    },
    {
      label: copy.pattern,
      value: inputMode === "stored" ? selectedPattern || "--" : `${gridSize} x ${gridSize}`,
    },
    {
      label: copy.updateMode,
      value: updateMode === "synchronous" ? copy.synchronous : copy.asynchronous,
    },
    {
      label: copy.noiseLevel,
      value: corruptionSummary,
    },
    {
      label: copy.maskRatio,
      value: maskingSummary,
    },
    {
      label: copy.maxRecallSteps,
      value: String(steps),
    },
  ];

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

      if (typeof window !== "undefined" && window.matchMedia("(max-width: 1279px)").matches) {
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
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
    <main className="mx-auto flex min-h-screen w-full max-w-[1420px] flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-10 lg:px-8 xl:px-10">
      <section className="panel overflow-hidden">
        <div className="panel-body relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(37,99,235,0.95),rgba(249,115,22,0.85))]"
          />

          <div className="space-y-6">
            <div className="inline-flex w-full flex-wrap items-center rounded-full border border-[rgba(37,99,235,0.16)] bg-[rgba(255,255,255,0.76)] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[rgb(var(--primary))] sm:w-fit sm:text-xs sm:tracking-[0.24em]">
              {copy.subtitle}
            </div>

            <div className="max-w-4xl space-y-4">
              <h1 className="font-display text-4xl font-semibold leading-none tracking-[-0.08em] text-[rgb(var(--text-primary))] sm:text-5xl lg:text-[4.4rem]">
                {copy.title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[rgb(var(--text-secondary))] sm:text-base sm:leading-8">
                {copy.description}
              </p>
            </div>

            <div className="grid gap-4 border-y border-[rgb(var(--border-subtle))] py-4 sm:grid-cols-3">
              {summaryItems.slice(0, 3).map((item) => (
                <div
                  key={item.label}
                  className="sm:border-l sm:border-[rgb(var(--border-subtle))] sm:pl-4 first:sm:border-l-0 first:sm:pl-0"
                >
                  <p className="info-tile-label">{item.label}</p>
                  <p className="mt-3 text-xl font-semibold tracking-[-0.05em] text-[rgb(var(--text-primary))] sm:text-2xl">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[rgb(var(--border-primary))] pt-5 lg:border-l lg:border-t-0 lg:pl-8">
            <div className="space-y-5">
              <div>
                <p className="section-label">{copy.controls}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-[rgb(var(--text-primary))]">
                  {copy.recallSettings}
                </h2>
              </div>

              <div className="space-y-3">
                {summaryItems.map((item) => (
                  <div key={item.label} className="detail-row">
                    <span className="text-sm font-semibold text-[rgb(var(--text-secondary))]">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-[rgb(var(--text-primary))]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start xl:gap-6">
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

        <div ref={resultsRef} className="scroll-mt-6">
          <ResultsPanel
            copy={copy}
            result={result}
            isSubmitting={isSubmitting}
            error={recallError}
          />
        </div>
      </div>

      <PatternGallery
        copy={copy}
        gallery={gallery}
        isLoading={galleryLoading}
        error={galleryError}
      />

      <section className="panel">
        <div className="panel-body space-y-6">
          <div className="max-w-2xl">
            <p className="section-label">{copy.howItWorks}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-[rgb(var(--text-primary))]">
              {copy.howItWorks}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {copy.explanation.map((paragraph, index) => (
              <div
                key={paragraph}
                className="border-t border-[rgb(var(--border-primary))] pt-4"
              >
                <div className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-[rgb(var(--accent))]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="mt-4 text-sm leading-7 text-[rgb(var(--text-secondary))]">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
