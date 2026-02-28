import { create } from "zustand";
import type { WebWorkerMLCEngine } from "@mlc-ai/web-llm";

export type ModelStatus = "idle" | "loading" | "ready" | "error";

interface ModelState {
  status: ModelStatus;
  loadProgress: number;
  loadingMessage: string;
  error: string | null;
  engine: WebWorkerMLCEngine | null;

  setStatus: (status: ModelStatus) => void;
  setProgress: (progress: number, message: string) => void;
  setReady: (engine: WebWorkerMLCEngine) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useModelStore = create<ModelState>((set) => ({
  status: "idle",
  loadProgress: 0,
  loadingMessage: "",
  error: null,
  engine: null,

  setStatus: (status) => set({ status }),
  setProgress: (loadProgress, loadingMessage) =>
    set({ loadProgress, loadingMessage }),
  setReady: (engine) => set({ status: "ready", error: null, engine }),
  setError: (error) => set({ error, status: "error" }),
  reset: () =>
    set({
      status: "idle",
      loadProgress: 0,
      loadingMessage: "",
      error: null,
      engine: null,
    }),
}));
