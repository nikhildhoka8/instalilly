"use client";

import { useCallback, useEffect, useRef } from "react";
import { useModelStore } from "@/stores/model-store";

export function useWebLLM(autoInit = false) {
  const {
    status,
    loadProgress,
    loadingMessage,
    error,
    engine,
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

    try {
      const { initializeWebLLM, DEFAULT_MODEL } = await import("@/lib/webllm");
      const eng = await initializeWebLLM((progress, message) => {
        setProgress(progress, message);
      }, DEFAULT_MODEL);
      setReady(eng);
    } catch (err) {
      console.error("Failed to initialize WebLLM:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize model");
    }
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
    engine,
    isReady: status === "ready",
    isLoading: status === "loading",
    initialize,
  };
}
