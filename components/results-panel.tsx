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

  return (
    <section className="panel min-h-0 xl:min-h-[720px]">
      <div className="panel-body flex h-full flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:flex-wrap">
          <div className="space-y-2">
            <p className="section-label">{copy.result}</p>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-[rgb(var(--text-primary))]">
              {copy.result}
            </h2>
          </div>

          {result ? (
            <span className="status-badge" data-variant={result.badge.variant}>
              {result.badge.text}
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="alert-card" data-variant="error">
            {error}
          </div>
        ) : null}

        {!result && !isSubmitting && !error ? (
          <div className="flex flex-1 items-center justify-center rounded-[24px] border border-dashed border-[rgba(37,99,235,0.22)] bg-[rgba(255,255,255,0.58)] px-4 py-10 text-center sm:rounded-[28px] sm:px-6 sm:py-16">
            <p className="max-w-md text-sm leading-7 text-[rgb(var(--text-secondary))]">
              {copy.emptyState}
            </p>
          </div>
        ) : null}

        {isSubmitting ? (
          <div className="space-y-4">
            <div className="skeleton h-[280px] w-full" />
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton h-[96px] w-full" />
              ))}
            </div>
            <div className="skeleton h-[240px] w-full" />
          </div>
        ) : null}

        {result && !isSubmitting ? (
          <div className="space-y-5">
            <div className="image-frame">
              <img
                alt={copy.result}
                src={result.images.comparison}
                className="w-full rounded-[16px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface-secondary))] sm:rounded-[20px]"
              />
            </div>

            <div className="grid gap-4 border-y border-[rgb(var(--border-subtle))] py-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1 xl:border-l xl:border-[rgb(var(--border-subtle))] xl:pl-5 first:xl:border-l-0 first:xl:pl-0">
                <p className="field-hint">{copy.accuracy}</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  {result.metrics.accuracyLabel}
                </p>
              </div>
              <div className="space-y-1 xl:border-l xl:border-[rgb(var(--border-subtle))] xl:pl-5">
                <p className="field-hint">{copy.errors}</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  {result.metrics.errorsLabel}
                </p>
              </div>
              <div className="space-y-1 xl:border-l xl:border-[rgb(var(--border-subtle))] xl:pl-5">
                <p className="field-hint">{copy.overlap}</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  {result.metrics.overlapLabel}
                </p>
              </div>
              <div className="space-y-1 xl:border-l xl:border-[rgb(var(--border-subtle))] xl:pl-5">
                <p className="field-hint">{copy.nearestPattern}</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  {result.metrics.nearest}
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-[rgb(var(--text-secondary))]">
              {result.infoLine}
            </p>

            <div className="border-t border-[rgb(var(--border-subtle))] pt-5">
              <div className="mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  className="tab-button w-full sm:w-auto"
                  data-state={activeTab === "trajectory" ? "active" : "inactive"}
                  onClick={() => setActiveTab("trajectory")}
                >
                  {copy.recallTrajectory}
                </button>
                <button
                  type="button"
                  className="tab-button w-full sm:w-auto"
                  data-state={activeTab === "overlap" ? "active" : "inactive"}
                  onClick={() => setActiveTab("overlap")}
                >
                  {copy.overlapAll}
                </button>
              </div>

              <div className="image-frame">
                <img
                  alt={activeTab === "trajectory" ? copy.recallTrajectory : copy.overlapAll}
                  src={
                    activeTab === "trajectory"
                      ? result.images.trajectory
                      : result.images.overlap
                  }
                  className="w-full rounded-[16px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface-secondary))]"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
