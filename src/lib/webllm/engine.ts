import {
  CreateWebWorkerMLCEngine,
  type WebWorkerMLCEngine,
  type InitProgressReport,
} from "@mlc-ai/web-llm";

let engineInstance: WebWorkerMLCEngine | null = null;
let initPromise: Promise<WebWorkerMLCEngine> | null = null;

export type ProgressCallback = (progress: number, message: string) => void;

// Use a smaller model for faster loading
export const DEFAULT_MODEL = "gemma-2-2b-it-q4f16_1-MLC";

export async function initializeWebLLM(
  onProgress?: ProgressCallback,
  modelId: string = DEFAULT_MODEL
): Promise<WebWorkerMLCEngine> {
  // Return existing engine if already initialized
  if (engineInstance) {
    return engineInstance;
  }

  // Return existing init promise if initialization is in progress
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const worker = new Worker(
        new URL("./worker.ts", import.meta.url),
        { type: "module" }
      );

      const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
        initProgressCallback: (report: InitProgressReport) => {
          onProgress?.(report.progress, report.text);
        },
      });

      engineInstance = engine;
      return engine;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

export function getEngine(): WebWorkerMLCEngine | null {
  return engineInstance;
}

export function isEngineReady(): boolean {
  return engineInstance !== null;
}

export async function resetEngine(): Promise<void> {
  if (engineInstance) {
    await engineInstance.resetChat();
  }
}

export async function unloadEngine(): Promise<void> {
  if (engineInstance) {
    await engineInstance.unload();
    engineInstance = null;
    initPromise = null;
  }
}
