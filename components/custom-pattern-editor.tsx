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
    if (dragValue === null) {
      return;
    }

    function stopDragging() {
      setDragValue(null);
    }

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [dragValue]);

  function handlePointerDown(index: number) {
    if (disabled) {
      return;
    }

    const nextValue: 1 | -1 = pattern[index] > 0 ? -1 : 1;
    onSetCell(index, nextValue);
    setDragValue(nextValue);
  }

  function handlePointerEnter(index: number) {
    if (disabled || dragValue === null) {
      return;
    }

    onSetCell(index, dragValue);
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="field-label">{copy.drawTitle}</p>
          <p className="field-hint mt-1">{copy.drawHelp}</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            className="secondary-button flex-1 sm:flex-none"
            disabled={disabled}
            onClick={onClear}
          >
            {copy.clearGrid}
          </button>
          <button
            type="button"
            className="secondary-button flex-1 sm:flex-none"
            disabled={disabled}
            onClick={onFill}
          >
            {copy.fillGrid}
          </button>
        </div>
      </div>

      <div
        aria-label={copy.drawTitle}
        className="grid gap-1 rounded-[20px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface-tertiary))] p-2 select-none sm:gap-2 sm:rounded-[24px] sm:p-3"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {pattern.map((value, index) => {
          const isActive = value > 0;

          return (
            <button
              key={index}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onPointerDown={(event) => {
                event.preventDefault();
                handlePointerDown(index);
              }}
              onPointerEnter={() => handlePointerEnter(index)}
              onPointerUp={() => setDragValue(null)}
              className={[
                "aspect-square touch-none rounded-md border transition duration-150 focus:outline-none focus:ring-4 focus:ring-[rgba(37,99,235,0.16)] disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-lg",
                isActive
                  ? "border-[rgba(37,99,235,0.52)] bg-[linear-gradient(135deg,rgba(37,99,235,0.94),rgba(30,64,175,0.96))] shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
                  : "border-[rgb(var(--border-subtle))] bg-white hover:border-[rgba(37,99,235,0.3)] hover:bg-[rgba(255,255,255,0.94)]",
              ].join(" ")}
            >
              <span className="sr-only">{`${copy.drawTitle} ${index + 1}`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
