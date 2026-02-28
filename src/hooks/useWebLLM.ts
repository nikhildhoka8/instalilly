"use client";

import { useCallback, useEffect, useRef } from "react";
import { useModelStore } from "@/stores/model-store";

// MOCK MODE: Set to true to skip actual model loading
const MOCK_MODE = true;

export function useWebLLM(autoInit = false) {
  const {
    status,
    loadProgress,
    loadingMessage,
    error,
    setStatus,
    setProgress,
    setReady,
    setError,
  } = useModelStore();

  const initRef = useRef(false);

  const initialize = useCallback(async () => {
    if (status === "loading" || status === "ready") {
      return;
    }

    setStatus("loading");

    if (MOCK_MODE) {
      // Simulate loading progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 200));
        setProgress(i / 100, `Loading model... ${i}%`);
      }
      setReady();
      return;
    }

    // Real WebLLM initialization would go here
    // Commented out for now
    /*
    try {
      const { initializeWebLLM, DEFAULT_MODEL } = await import("@/lib/webllm");
      const eng = await initializeWebLLM((progress, message) => {
        setProgress(progress, message);
      }, DEFAULT_MODEL);
      setReady();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize model");
    }
    */
  }, [status, setStatus, setProgress, setReady, setError]);

  // Auto-initialize on mount if autoInit is true
  useEffect(() => {
    if (autoInit && !initRef.current && status === "idle") {
      initRef.current = true;
      initialize();
    }
  }, [autoInit, status, initialize]);

  return {
    status,
    loadProgress,
    loadingMessage,
    error,
    isReady: status === "ready",
    isLoading: status === "loading",
    initialize,
  };
}
