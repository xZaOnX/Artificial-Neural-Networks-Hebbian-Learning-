import { CustomPatternEditor } from "@/components/custom-pattern-editor";
import { DashboardCopy, InputMode, Lang, UpdateMode } from "@/lib/types";

interface ControlPanelProps {
  copy: DashboardCopy;
  lang: Lang;
  inputMode: InputMode;
  selectedPattern: string;
  patternNames: string[];
  gridSize: number;
  customPattern: number[];
  noiseLevel: number;
  maskRatio: number;
  updateMode: UpdateMode;
  steps: number;
  threshold: number;
  seed: number;
  isBusy: boolean;
  onLangChange: (lang: Lang) => void;
  onInputModeChange: (mode: InputMode) => void;
  onPatternChange: (pattern: string) => void;
  onNoiseLevelChange: (value: number) => void;
  onMaskRatioChange: (value: number) => void;
  onUpdateModeChange: (mode: UpdateMode) => void;
  onStepsChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
  onSeedChange: (value: number) => void;
  onSetCustomCell: (index: number, value: 1 | -1) => void;
  onClearCustomPattern: () => void;
  onFillCustomPattern: () => void;
  onSubmit: () => void;
}

function formatRatio(value: number) {
  return value.toFixed(2);
}

export function ControlPanel({
  copy,
  lang,
  inputMode,
  selectedPattern,
  patternNames,
  gridSize,
  customPattern,
  noiseLevel,
  maskRatio,
  updateMode,
  steps,
  threshold,
  seed,
  isBusy,
  onLangChange,
  onInputModeChange,
  onPatternChange,
  onNoiseLevelChange,
  onMaskRatioChange,
  onUpdateModeChange,
  onStepsChange,
  onThresholdChange,
  onSeedChange,
  onSetCustomCell,
  onClearCustomPattern,
  onFillCustomPattern,
  onSubmit,
}: ControlPanelProps) {
  const corruptionDisabled = isBusy || inputMode === "custom";
  const noiseValueLabel = inputMode === "stored" ? formatRatio(noiseLevel) : "--";
  const maskValueLabel = inputMode === "stored" ? formatRatio(maskRatio) : "--";

  return (
    <aside className="panel xl:sticky xl:top-8">
      <div className="panel-body space-y-5">
        <div className="space-y-3">
          <p className="section-label">{copy.controls}</p>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-[rgb(var(--text-primary))]">
            {copy.controls}
          </h2>
        </div>

        <div className="grid gap-5 border-t border-[rgb(var(--border-subtle))] pt-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="field-label">{copy.language}</label>
            </div>
            <div className="segmented grid-cols-2">
              {(["en", "tr"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={isBusy}
                  data-state={lang === value ? "active" : "inactive"}
                  className="segment-button uppercase"
                  onClick={() => onLangChange(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="field-label">{copy.inputMode}</label>
            </div>
            <div className="segmented grid-cols-2">
              <button
                type="button"
                disabled={isBusy}
                data-state={inputMode === "stored" ? "active" : "inactive"}
                className="segment-button"
                onClick={() => onInputModeChange("stored")}
              >
                {copy.storedPattern}
              </button>
              <button
                type="button"
                disabled={isBusy}
                data-state={inputMode === "custom" ? "active" : "inactive"}
                className="segment-button"
                onClick={() => onInputModeChange("custom")}
              >
                {copy.drawCustom}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-[rgb(var(--border-subtle))] pt-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="field-label" htmlFor="pattern-select">
                {copy.pattern}
              </label>
            </div>
            <select
              id="pattern-select"
              className="input-base"
              disabled={isBusy || inputMode === "custom" || patternNames.length === 0}
              value={selectedPattern}
              onChange={(event) => onPatternChange(event.target.value)}
            >
              {patternNames.map((patternName) => (
                <option key={patternName} value={patternName}>
                  {patternName}
                </option>
              ))}
            </select>
          </div>

          {inputMode === "custom" ? (
            <CustomPatternEditor
              copy={copy}
              gridSize={gridSize}
              pattern={customPattern}
              disabled={isBusy}
              onSetCell={onSetCustomCell}
              onClear={onClearCustomPattern}
              onFill={onFillCustomPattern}
            />
          ) : null}
        </div>

        <div className="space-y-4 border-t border-[rgb(var(--border-subtle))] pt-5">
          <p className="section-label">{copy.corruption}</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="field-label" htmlFor="noise-level">
                {copy.noiseLevel}
              </label>
              <span className="field-hint">{noiseValueLabel}</span>
            </div>
            <input
              id="noise-level"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={noiseLevel}
              disabled={corruptionDisabled}
              className="range-base"
              onChange={(event) => onNoiseLevelChange(Number(event.target.value))}
            />
            <p className="field-hint">{copy.noiseHelp}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="field-label" htmlFor="mask-ratio">
                {copy.maskRatio}
              </label>
              <span className="field-hint">{maskValueLabel}</span>
            </div>
            <input
              id="mask-ratio"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={maskRatio}
              disabled={corruptionDisabled}
              className="range-base"
              onChange={(event) => onMaskRatioChange(Number(event.target.value))}
            />
            <p className="field-hint">{copy.maskHelp}</p>
          </div>
        </div>

        <div className="space-y-4 border-t border-[rgb(var(--border-subtle))] pt-5">
          <p className="section-label">{copy.recallSettings}</p>

          <div className="space-y-3">
            <label className="field-label">{copy.updateMode}</label>
            <div className="segmented grid-cols-2">
              <button
                type="button"
                disabled={isBusy}
                data-state={updateMode === "synchronous" ? "active" : "inactive"}
                className="segment-button"
                onClick={() => onUpdateModeChange("synchronous")}
              >
                {copy.synchronous}
              </button>
              <button
                type="button"
                disabled={isBusy}
                data-state={updateMode === "asynchronous" ? "active" : "inactive"}
                className="segment-button"
                onClick={() => onUpdateModeChange("asynchronous")}
              >
                {copy.asynchronous}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="field-label" htmlFor="steps">
                {copy.maxRecallSteps}
              </label>
              <span className="field-hint">{steps}</span>
            </div>
            <input
              id="steps"
              type="range"
              min={1}
              max={50}
              step={1}
              value={steps}
              disabled={isBusy}
              className="range-base"
              onChange={(event) => onStepsChange(Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="field-label" htmlFor="threshold">
                {copy.activationThreshold}
              </label>
              <span className="field-hint">{formatRatio(threshold)}</span>
            </div>
            <input
              id="threshold"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={threshold}
              disabled={isBusy}
              className="range-base"
              onChange={(event) => onThresholdChange(Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="field-label" htmlFor="seed">
              {copy.randomSeed}
            </label>
            <input
              id="seed"
              type="number"
              className="input-base"
              disabled={isBusy}
              value={seed}
              onChange={(event) => onSeedChange(Number(event.target.value) || 0)}
            />
          </div>
        </div>

        <button type="button" className="primary-button" disabled={isBusy} onClick={onSubmit}>
          {isBusy ? copy.running : copy.runRecall}
        </button>
      </div>
    </aside>
  );
}
