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

export function ResultsPanel({ copy, result, isSubmitting, error }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>("trajectory");

  useEffect(() => {
    setActiveTab("trajectory");
  }, [result?.images.comparison]);

  return (
    <section className="flex min-h-0 flex-col p-6 sm:p-8 xl:min-h-[600px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="section-label">{copy.result}</p>
        {result && (
          <span className="status-badge" data-variant={result.badge.variant}>
            {result.badge.text}
          </span>
        )}
      </div>

      {error && <div className="alert-card mb-4" data-variant="error">{error}</div>}

      {!result && !isSubmitting && !error && (
        <div
          className="flex flex-1 items-center justify-center border border-dashed py-16 text-center"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <p className="max-w-sm text-sm leading-6 text-[rgb(var(--text-muted))]">
            {copy.emptyState}
          </p>
        </div>
      )}

      {isSubmitting && (
        <div className="space-y-4">
          <div className="skeleton h-64 w-full" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14 w-full" />
            ))}
          </div>
          <div className="skeleton h-52 w-full" />
        </div>
      )}

      {result && !isSubmitting && (
        <div className="space-y-6">
          <img
            alt={copy.result}
            src={result.images.comparison}
            className="w-full border"
            style={{ borderColor: "rgb(var(--border))" }}
          />

          {/* Metrics — plain row, no boxes */}
          <div
            className="grid grid-cols-2 gap-x-8 gap-y-4 border-y py-4 sm:grid-cols-4"
            style={{ borderColor: "rgb(var(--border-subtle))" }}
          >
            {[
              { label: copy.accuracy, value: result.metrics.accuracyLabel },
              { label: copy.errors, value: result.metrics.errorsLabel },
              { label: copy.overlap, value: result.metrics.overlapLabel },
              { label: copy.nearestPattern, value: result.metrics.nearest },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-[rgb(var(--text-primary))]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-[rgb(var(--text-muted))]">{result.infoLine}</p>

          {/* Tabs */}
          <div>
            <div
              className="mb-4 flex gap-1 border-b pb-1"
              style={{ borderColor: "rgb(var(--border-subtle))" }}
            >
              <button type="button" className="tab-button"
                data-state={activeTab === "trajectory" ? "active" : "inactive"}
                onClick={() => setActiveTab("trajectory")}>
                {copy.recallTrajectory}
              </button>
              <button type="button" className="tab-button"
                data-state={activeTab === "overlap" ? "active" : "inactive"}
                onClick={() => setActiveTab("overlap")}>
                {copy.overlapAll}
              </button>
            </div>
            <img
              alt={activeTab === "trajectory" ? copy.recallTrajectory : copy.overlapAll}
              src={activeTab === "trajectory" ? result.images.trajectory : result.images.overlap}
              className="w-full border"
              style={{ borderColor: "rgb(var(--border))" }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
