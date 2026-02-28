"use client";

import { useCallback, useRef, useState } from "react";
import { useModelStore } from "@/stores/model-store";
import { MedicalAgent } from "@/lib/agent/medical-agent";
import type { Attachment, PatientContext, ReasoningStep } from "@/types";

export function useChatAgent() {
  const { engine, status } = useModelStore();
  const agentRef = useRef<MedicalAgent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");

  // Lazily create the agent when the engine is available
  const getAgent = useCallback(() => {
    if (!engine) return null;
    if (!agentRef.current) {
      agentRef.current = new MedicalAgent(engine);
    }
    return agentRef.current;
  }, [engine]);

  // Non-streaming version (kept for compatibility)
  const processInput = useCallback(
    async (
      message: string,
      attachments: Attachment[] = [],
      patientContext: PatientContext | null = null
    ): Promise<{
      response: string;
      reasoning: string[];
    }> => {
      const agent = getAgent();

      if (!agent) {
        throw new Error("Model not loaded. Please wait for initialization.");
      }

      setIsProcessing(true);
      setReasoningSteps([]);
      setCurrentStep("");

      try {
        const result = await agent.process(
          { message, attachments, patientContext },
          (step) => {
            setCurrentStep(step.step);
            setReasoningSteps((prev) => [
              ...prev,
              {
                id: `${step.step}-${Date.now()}`,
                step: step.step,
                description: step.description,
                status: "completed",
              },
            ]);
          }
        );

        return result;
      } catch (error) {
        console.error("Error processing input:", error);
        throw error;
      } finally {
        setIsProcessing(false);
        setCurrentStep("");
      }
    },
    [getAgent]
  );

  // Streaming version - yields tokens as they're generated
  const processInputStreaming = useCallback(
    async (
      message: string,
      attachments: Attachment[] = [],
      patientContext: PatientContext | null = null,
      onToken: (token: string) => void
    ): Promise<{ reasoning: string[] }> => {
      const agent = getAgent();

      if (!agent) {
        throw new Error("Model not loaded. Please wait for initialization.");
      }

      setIsProcessing(true);
      setReasoningSteps([]);
      setCurrentStep("");

      const reasoning: string[] = [];

      try {
        const stream = agent.processStreaming(
          { message, attachments, patientContext },
          (step) => {
            setCurrentStep(step.step);
            reasoning.push(step.description);
            setReasoningSteps((prev) => [
              ...prev,
              {
                id: `${step.step}-${Date.now()}`,
                step: step.step,
                description: step.description,
                status: "completed",
              },
            ]);
          }
        );

        for await (const chunk of stream) {
          if (!chunk.isComplete && chunk.token) {
            onToken(chunk.token);
          }
        }

        return { reasoning };
      } catch (error) {
        console.error("Error processing input:", error);
        throw error;
      } finally {
        setIsProcessing(false);
        setCurrentStep("");
      }
    },
    [getAgent]
  );

  const resetConversation = useCallback(() => {
    agentRef.current?.reset();
    setReasoningSteps([]);
    setCurrentStep("");
  }, []);

  return {
    isReady: status === "ready" && engine !== null,
    isProcessing,
    reasoningSteps,
    currentStep,
    processInput,
    processInputStreaming,
    resetConversation,
  };
}
