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

function fmt(v: number) {
  return v.toFixed(2);
}

function SliderField({
  id, label, min, max, step, value, disabled, onChange,
}: {
  id: string; label: string; min: number; max: number; step: number;
  value: number; disabled?: boolean; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor={id} className="shrink-0 text-sm text-[rgb(var(--text-secondary))]">
        {label}
      </label>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        disabled={disabled} className="range-base w-28 shrink-0"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-9 shrink-0 text-right text-sm font-semibold text-[rgb(var(--text-primary))]">
        {fmt(value)}
      </span>
    </div>
  );
}

const vr = { borderLeft: "1px solid rgb(var(--border-subtle))", alignSelf: "stretch" };

export function ControlPanel({
  copy, lang, inputMode, selectedPattern, patternNames, gridSize,
  customPattern, noiseLevel, maskRatio, updateMode, steps, threshold, seed,
  isBusy, onLangChange, onInputModeChange, onPatternChange, onNoiseLevelChange,
  onMaskRatioChange, onUpdateModeChange, onStepsChange, onThresholdChange,
  onSeedChange, onSetCustomCell, onClearCustomPattern, onFillCustomPattern, onSubmit,
}: ControlPanelProps) {
  const corruptionDisabled = isBusy || inputMode === "custom";

  return (
    <div>
      {/* Horizontal controls bar */}
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-4 border-b px-6 py-4"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        {/* Language */}
        <div className="segmented grid-cols-2">
          {(["en", "tr"] as const).map((v) => (
            <button key={v} type="button" disabled={isBusy}
              data-state={lang === v ? "active" : "inactive"}
              className="segment-button px-4 py-2 uppercase text-xs"
              onClick={() => onLangChange(v)}>
              {v}
            </button>
          ))}
        </div>

        <div style={vr} />

        {/* Input mode */}
        <div className="segmented grid-cols-2">
          <button type="button" disabled={isBusy}
            data-state={inputMode === "stored" ? "active" : "inactive"}
            className="segment-button px-4 py-2 text-xs"
            onClick={() => onInputModeChange("stored")}>
            {copy.storedPattern}
          </button>
          <button type="button" disabled={isBusy}
            data-state={inputMode === "custom" ? "active" : "inactive"}
            className="segment-button px-4 py-2 text-xs"
            onClick={() => onInputModeChange("custom")}>
            {copy.drawCustom}
          </button>
        </div>

        {/* Pattern select */}
        <select
          className="input-base w-auto py-2 text-sm"
          disabled={isBusy || inputMode === "custom" || patternNames.length === 0}
          value={selectedPattern}
          onChange={(e) => onPatternChange(e.target.value)}
        >
          {patternNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>

        <div style={vr} />

        {/* Noise */}
        <SliderField
          id="noise-level" label={copy.noiseLevel}
          min={0} max={1} step={0.05} value={noiseLevel}
          disabled={corruptionDisabled}
          onChange={onNoiseLevelChange}
        />

        {/* Mask */}
        <SliderField
          id="mask-ratio" label={copy.maskRatio}
          min={0} max={1} step={0.05} value={maskRatio}
          disabled={corruptionDisabled}
          onChange={onMaskRatioChange}
        />

        <div style={vr} />

        {/* Update mode */}
        <div className="segmented grid-cols-2">
          <button type="button" disabled={isBusy}
            data-state={updateMode === "synchronous" ? "active" : "inactive"}
            className="segment-button px-4 py-2 text-xs"
            onClick={() => onUpdateModeChange("synchronous")}>
            {copy.synchronous}
          </button>
          <button type="button" disabled={isBusy}
            data-state={updateMode === "asynchronous" ? "active" : "inactive"}
            className="segment-button px-4 py-2 text-xs"
            onClick={() => onUpdateModeChange("asynchronous")}>
            {copy.asynchronous}
          </button>
        </div>

        {/* Steps */}
        <SliderField
          id="steps" label={copy.maxRecallSteps}
          min={1} max={50} step={1} value={steps}
          disabled={isBusy}
          onChange={onStepsChange}
        />

        {/* Threshold */}
        <SliderField
          id="threshold" label={copy.activationThreshold}
          min={0} max={1} step={0.05} value={threshold}
          disabled={isBusy}
          onChange={onThresholdChange}
        />

        <div style={vr} />

        {/* Seed */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="seed" className="shrink-0 text-sm text-[rgb(var(--text-secondary))]">
            {copy.randomSeed}
          </label>
          <input
            id="seed" type="number"
            className="input-base w-24 py-2 text-sm"
            disabled={isBusy} value={seed}
            onChange={(e) => onSeedChange(Number(e.target.value) || 0)}
          />
        </div>

        <div style={vr} />

        {/* Run */}
        <button
          type="button"
          className="primary-button w-auto min-w-[120px] py-2 text-sm"
          disabled={isBusy}
          onClick={onSubmit}
        >
          {isBusy ? copy.running : copy.runRecall}
        </button>
      </div>

      {/* Custom pattern editor — shown below bar when active */}
      {inputMode === "custom" && (
        <div className="border-b px-6 py-4" style={{ borderColor: "rgb(var(--border))" }}>
          <CustomPatternEditor
            copy={copy} gridSize={gridSize} pattern={customPattern}
            disabled={isBusy} onSetCell={onSetCustomCell}
            onClear={onClearCustomPattern} onFill={onFillCustomPattern}
          />
        </div>
      )}
    </div>
  );
}
