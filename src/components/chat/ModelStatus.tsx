"use client";

import { cn } from "@/lib/utils";
import { useWebLLM } from "@/hooks";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface ModelStatusProps {
  className?: string;
}

export function ModelStatus({ className }: ModelStatusProps) {
  const { status, loadProgress, loadingMessage, error } = useWebLLM();

  if (status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        status === "loading" && "border-blue-200 bg-blue-50 text-blue-700",
        status === "ready" && "border-green-200 bg-green-50 text-green-700",
        status === "error" && "border-red-200 bg-red-50 text-red-700",
        className
      )}
    >
      {status === "loading" && (
        <>
          <Loader2 className="size-4 animate-spin" />
          <div className="flex flex-col">
            <span className="font-medium">Loading AI Model</span>
            <span className="text-xs opacity-80">
              {loadingMessage || `${Math.round(loadProgress * 100)}%`}
            </span>
          </div>
          <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-blue-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${loadProgress * 100}%` }}
            />
          </div>
        </>
      )}

      {status === "ready" && (
        <>
          <CheckCircle2 className="size-4" />
          <span>AI Model Ready</span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="size-4" />
          <span>{error || "Failed to load model"}</span>
        </>
      )}
    </div>
  );
}
