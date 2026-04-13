export type Lang = "en" | "tr";
export type InputMode = "stored" | "custom";
export type UpdateMode = "synchronous" | "asynchronous";

export interface GalleryResponse {
  lang: Lang;
  gridSize: number;
  defaultPattern: string;
  patternNames: string[];
  patternCount: number;
  galleryCaption: string;
  galleryImage: string;
}

export interface RecallResponse {
  lang: Lang;
  inputMode: InputMode;
  selectedPattern: string;
  updateMode: UpdateMode;
  badge: {
    variant: "success" | "failure" | "neutral";
    text: string;
  };
  isCorrect: boolean | null;
  metrics: {
    accuracy: number;
    accuracyLabel: string;
    errors: number;
    errorsLabel: string;
    totalBits: number;
    overlap: number;
    overlapLabel: string;
    nearest: string;
  };
  summary: {
    convergedSteps: number;
    energy: number;
  };
  infoLine: string;
  images: {
    comparison: string;
    trajectory: string;
    overlap: string;
  };
}

export interface DashboardCopy {
  title: string;
  subtitle: string;
  description: string;
  controls: string;
  language: string;
  inputMode: string;
  storedPattern: string;
  drawCustom: string;
  pattern: string;
  corruption: string;
  noiseLevel: string;
  noiseHelp: string;
  maskRatio: string;
  maskHelp: string;
  recallSettings: string;
  updateMode: string;
  synchronous: string;
  asynchronous: string;
  maxRecallSteps: string;
  activationThreshold: string;
  randomSeed: string;
  runRecall: string;
  running: string;
  clearGrid: string;
  fillGrid: string;
  drawTitle: string;
  drawHelp: string;
  storedPatterns: string;
  result: string;
  accuracy: string;
  errors: string;
  overlap: string;
  nearestPattern: string;
  recallTrajectory: string;
  overlapAll: string;
  howItWorks: string;
  emptyState: string;
  galleryLoading: string;
  galleryError: string;
  recallError: string;
  success: string;
  failure: string;
  explanation: string[];
  convergedLabel: (steps: number) => string;
  energyLabel: (energy: number) => string;
}
