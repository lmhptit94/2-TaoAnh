
export enum WorkflowStage {
  INITIAL = 1,
  IN_PROGRESS = 2,
  FINAL = 3,
  COMPLETED = 4
}

export interface RenovationImage {
  stage: number;
  url: string;
  base64: string;
  promptUsed: string;
}

export interface AppState {
  currentStage: WorkflowStage;
  prompt: string;
  images: Record<number, RenovationImage | null>;
  isGenerating: boolean;
  error: string | null;
}
