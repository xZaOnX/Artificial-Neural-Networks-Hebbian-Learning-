"use client";

import { useEffect, useState } from "react";

import { DashboardCopy, RecallResponse } from "@/lib/types";

interface ResultsPanelProps {
  copy: DashboardCopy;
  result: RecallResponse | null;
  isSubmitting: boolean;
  error: string | null;
}

type ResultTab = "trajectory" | "overlap";

export function ResultsPanel({
  copy,
  result,
  isSubmitting,
  error,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>("trajectory");

  useEffect(() => {
    setActiveTab("trajectory");
  }, [result?.images.comparison]);

  const badgeText =
    result?.inputMode === "custom"
      ? `→ ${result.metrics.nearest}`
      : result?.isCorrect
        ? copy.success
        : copy.failure;

  return (
    <section className="panel min-h-[620px]">
      <div className="panel-body flex h-full flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="section-label">{copy.result}</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[rgb(var(--text-primary))]">
              {copy.result}
            </h2>
          </div>

          {result ? (
            <span className="status-badge" data-variant={result.badge.variant}>
              {badgeText}
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="alert-card" data-variant="error">
            {error}
          </div>
        ) : null}

        {!result && !isSubmitting && !error ? (
          <div className="flex flex-1 items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/10 px-6 py-16 text-center">
            <p className="max-w-md text-sm leading-7 text-[rgb(var(--text-secondary))]">
              {copy.emptyState}
            </p>
          </div>
        ) : null}

        {isSubmitting ? (
          <div className="space-y-4">
            <div className="skeleton h-[280px] w-full" />
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton h-[96px] w-full" />
              ))}
            </div>
            <div className="skeleton h-[240px] w-full" />
          </div>
        ) : null}

        {result && !isSubmitting ? (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-3">
              <img
                alt={copy.result}
                src={result.images.comparison}
                className="w-full rounded-[18px] border border-white/5 bg-black/15"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="metric-card">
                <p className="field-hint">{copy.accuracy}</p>
                <p className="mt-3 text-2xl font-semibold">{result.metrics.accuracyLabel}</p>
              </div>
              <div className="metric-card">
                <p className="field-hint">{copy.errors}</p>
                <p className="mt-3 text-2xl font-semibold">{result.metrics.errorsLabel}</p>
              </div>
              <div className="metric-card">
                <p className="field-hint">{copy.overlap}</p>
                <p className="mt-3 text-2xl font-semibold">{result.metrics.overlapLabel}</p>
              </div>
              <div className="metric-card">
                <p className="field-hint">{copy.nearestPattern}</p>
                <p className="mt-3 text-2xl font-semibold">{result.metrics.nearest}</p>
              </div>
            </div>

            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {copy.convergedLabel(result.summary.convergedSteps)} {" • "}
              {copy.energyLabel(result.summary.energy)}
            </p>

            <div className="rounded-[24px] border border-white/10 bg-black/15 p-3">
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="tab-button"
                  data-state={activeTab === "trajectory" ? "active" : "inactive"}
                  onClick={() => setActiveTab("trajectory")}
                >
                  {copy.recallTrajectory}
                </button>
                <button
                  type="button"
                  className="tab-button"
                  data-state={activeTab === "overlap" ? "active" : "inactive"}
                  onClick={() => setActiveTab("overlap")}
                >
                  {copy.overlapAll}
                </button>
              </div>

              <div className="overflow-hidden rounded-[18px] border border-white/5 bg-black/15 p-2">
                <img
                  alt={activeTab === "trajectory" ? copy.recallTrajectory : copy.overlapAll}
                  src={
                    activeTab === "trajectory"
                      ? result.images.trajectory
                      : result.images.overlap
                  }
                  className="w-full rounded-[14px]"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
