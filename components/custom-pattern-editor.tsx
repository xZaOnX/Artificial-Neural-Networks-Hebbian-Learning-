import { useEffect, useState } from "react";

import { DashboardCopy } from "@/lib/types";

interface CustomPatternEditorProps {
  copy: DashboardCopy;
  gridSize: number;
  pattern: number[];
  disabled?: boolean;
  onSetCell: (index: number, value: 1 | -1) => void;
  onClear: () => void;
  onFill: () => void;
}

export function CustomPatternEditor({
  copy,
  gridSize,
  pattern,
  disabled = false,
  onSetCell,
  onClear,
  onFill,
}: CustomPatternEditorProps) {
  const [dragValue, setDragValue] = useState<1 | -1 | null>(null);

  useEffect(() => {
    if (dragValue === null) return;
    function stop() { setDragValue(null); }
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragValue]);

  function handlePointerDown(index: number) {
    if (disabled) return;
    const next: 1 | -1 = pattern[index] > 0 ? -1 : 1;
    onSetCell(index, next);
    setDragValue(next);
  }

  function handlePointerEnter(index: number) {
    if (disabled || dragValue === null) return;
    onSetCell(index, dragValue);
  }

  return (
    <div className="flex items-start gap-4">
      {/* Grid */}
      <div
        aria-label={copy.drawTitle}
        className="select-none border"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: "2px",
          padding: "4px",
          borderColor: "rgb(var(--border))",
          background: "rgb(var(--surface-dim))",
        }}
      >
        {pattern.map((value, index) => {
          const isActive = value > 0;
          return (
            <button
              key={index}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onPointerDown={(e) => { e.preventDefault(); handlePointerDown(index); }}
              onPointerEnter={() => handlePointerEnter(index)}
              onPointerUp={() => setDragValue(null)}
              style={{ width: 18, height: 18, touchAction: "none" }}
              className={[
                "border transition-colors duration-75 focus:outline-none disabled:cursor-not-allowed",
                isActive
                  ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]"
                  : "border-[rgb(var(--border))] bg-white hover:bg-[rgb(var(--accent-light))]",
              ].join(" ")}
            >
              <span className="sr-only">{index + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 pt-1">
        <p className="text-xs text-[rgb(var(--text-muted))]">{copy.drawHelp}</p>
        <button type="button" className="secondary-button" disabled={disabled} onClick={onClear}>
          {copy.clearGrid}
        </button>
        <button type="button" className="secondary-button" disabled={disabled} onClick={onFill}>
          {copy.fillGrid}
        </button>
      </div>
    </div>
  );
}
