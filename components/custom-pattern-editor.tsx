import { DashboardCopy } from "@/lib/types";

interface CustomPatternEditorProps {
  copy: DashboardCopy;
  gridSize: number;
  pattern: number[];
  disabled?: boolean;
  onToggleCell: (index: number) => void;
  onClear: () => void;
  onFill: () => void;
}

export function CustomPatternEditor({
  copy,
  gridSize,
  pattern,
  disabled = false,
  onToggleCell,
  onClear,
  onFill,
}: CustomPatternEditorProps) {
  return (
    <div className="space-y-4 rounded-[24px] border border-white/10 bg-black/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="field-label">{copy.drawTitle}</p>
          <p className="field-hint mt-1">{copy.drawHelp}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="secondary-button"
            disabled={disabled}
            onClick={onClear}
          >
            {copy.clearGrid}
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={disabled}
            onClick={onFill}
          >
            {copy.fillGrid}
          </button>
        </div>
      </div>

      <div
        aria-label={copy.drawTitle}
        className="grid gap-2 rounded-[22px] bg-[rgba(7,17,31,0.75)] p-3"
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
              onClick={() => onToggleCell(index)}
              className={[
                "aspect-square rounded-lg border transition duration-150 focus:outline-none focus:ring-4 focus:ring-[rgba(255,183,3,0.18)] disabled:cursor-not-allowed disabled:opacity-50",
                isActive
                  ? "border-amber-300/60 bg-[linear-gradient(135deg,rgba(255,183,3,0.9),rgba(251,133,0,0.95))] shadow-[0_8px_24px_rgba(251,133,0,0.28)]"
                  : "border-white/10 bg-[rgba(16,35,58,0.72)] hover:border-amber-300/30 hover:bg-[rgba(23,52,84,0.86)]",
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
