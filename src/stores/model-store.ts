import { create } from "zustand";

export type ModelStatus = "idle" | "loading" | "ready" | "error";

interface ModelState {
  status: ModelStatus;
  loadProgress: number;
  loadingMessage: string;
  error: string | null;

  setStatus: (status: ModelStatus) => void;
  setProgress: (progress: number, message: string) => void;
  setReady: () => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useModelStore = create<ModelState>((set) => ({
  status: "idle",
  loadProgress: 0,
  loadingMessage: "",
  error: null,

  setStatus: (status) => set({ status }),
  setProgress: (loadProgress, loadingMessage) =>
    set({ loadProgress, loadingMessage }),
  setReady: () => set({ status: "ready", error: null }),
  setError: (error) => set({ error, status: "error" }),
  reset: () =>
    set({
      status: "idle",
      loadProgress: 0,
      loadingMessage: "",
      error: null,
    }),
}));
