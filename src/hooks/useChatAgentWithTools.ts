"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useModelStore } from "@/stores/model-store";
import { useToolCallStore } from "@/stores/tool-call-store";
import {
  MedicalAgentWithTools,
  parseToolCalls,
  removeToolCallBlocks,
  executeToolCall,
  type ToolCallRequest,
} from "@/lib/agent/medical-agent-with-tools";
import type { Attachment, PatientContext, ReasoningStep } from "@/types";

export function useChatAgentWithTools() {
  const { engine, status } = useModelStore();
  const agentRef = useRef<MedicalAgentWithTools | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");

  // Tool call store
  const {
    pendingToolCalls,
    addPendingToolCall,
    setToolCallExecuting,
    setToolCallCompleted,
    setToolCallError,
    clearAllToolCalls,
  } = useToolCallStore();

  // Pending tool execution state
  const [pendingExecution, setPendingExecution] = useState<{
    toolCalls: ToolCallRequest[];
    toolCallIds: string[];
    onComplete: (results: Map<string, string>) => void;
  } | null>(null);

  // Lazily create the agent
  const getAgent = useCallback(() => {
    if (!engine) return null;
    if (!agentRef.current) {
      agentRef.current = new MedicalAgentWithTools(engine);
    }
    return agentRef.current;
  }, [engine]);

  // Watch for approved tool calls and execute them
  useEffect(() => {
    if (!pendingExecution) return;

    const { toolCalls, toolCallIds, onComplete } = pendingExecution;
    const results = new Map<string, string>();
    let allProcessed = true;

    // Check status of each pending tool call
    for (let i = 0; i < toolCallIds.length; i++) {
      const tcId = toolCallIds[i];
      const tc = pendingToolCalls.find((t) => t.id === tcId);
      const currentToolCall = toolCalls[i];

      if (!tc || !currentToolCall) continue;

      if (tc.status === "pending") {
        allProcessed = false;
      } else if (tc.status === "approved") {
        // Execute this tool
        allProcessed = false;

        (async () => {
          setToolCallExecuting(tcId);

          try {
            const result = await executeToolCall(currentToolCall);
            setToolCallCompleted(tcId, result);
          } catch (error) {
            setToolCallError(
              tcId,
              error instanceof Error ? error.message : "Unknown error"
            );
          }
        })();
      } else if (tc.status === "completed" && tc.result) {
        results.set(currentToolCall.tool, tc.result);
      } else if (tc.status === "rejected") {
        results.set(currentToolCall.tool, "[Tool call was rejected by user]");
      } else if (tc.status === "error") {
        results.set(currentToolCall.tool, `[Error: ${tc.error}]`);
      } else if (tc.status === "executing") {
        allProcessed = false;
      }
    }

    // Check if all tool calls are processed
    const completedCount = toolCallIds.filter((id) => {
      const tc = pendingToolCalls.find((t) => t.id === id);
      return (
        tc &&
        (tc.status === "completed" ||
          tc.status === "rejected" ||
          tc.status === "error")
      );
    }).length;

    if (completedCount === toolCallIds.length && allProcessed) {
      setPendingExecution(null);
      onComplete(results);
    }
  }, [
    pendingExecution,
    pendingToolCalls,
    setToolCallExecuting,
    setToolCallCompleted,
    setToolCallError,
  ]);

  // Process input with tool support
  const processInputWithTools = useCallback(
    async (
      message: string,
      attachments: Attachment[] = [],
      patientContext: PatientContext | null = null,
      onToken: (token: string) => void,
      onToolCallsDetected?: (toolCalls: ToolCallRequest[]) => void
    ): Promise<{ reasoning: string[] }> => {
      const agent = getAgent();

      if (!agent) {
        throw new Error("Model not loaded. Please wait for initialization.");
      }

      setIsProcessing(true);
      setReasoningSteps([]);
      setCurrentStep("");
      clearAllToolCalls();

      const reasoning: string[] = [];

      const addStep = (step: { step: string; description: string }) => {
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
      };

      try {
        // Initial streaming
        const stream = agent.processStreaming(
          { message, attachments, patientContext },
          addStep
        );

        let detectedToolCalls: ToolCallRequest[] = [];
        let fullResponse = "";
        let emittedLength = 0;

        // Patterns that indicate a tool call might be starting
        const toolCallPrefixes = ["tool_call", "```tool_call", "```tool", "```json", "```j", "```", "json {", "json{", '{ "tool"', '{"tool"'];

        for await (const chunk of stream) {
          if (!chunk.isComplete && chunk.token) {
            fullResponse += chunk.token;

            // Clean the full response to remove any complete tool call blocks
            let cleanedResponse = removeToolCallBlocks(fullResponse);

            // Check if the end of the cleaned response might be start of a tool call
            // If so, hold back that portion until we know more
            let holdBackLength = 0;
            for (const prefix of toolCallPrefixes) {
              // Check if the cleaned response ends with a partial match of any prefix
              for (let i = 1; i <= prefix.length; i++) {
                const partial = prefix.substring(0, i);
                if (cleanedResponse.endsWith(partial)) {
                  holdBackLength = Math.max(holdBackLength, i);
                }
              }
            }

            // Also check for partial "tool_call{" that hasn't completed
            const toolCallMatch = cleanedResponse.match(/tool_call\s*$/);
            if (toolCallMatch) {
              holdBackLength = Math.max(holdBackLength, toolCallMatch[0].length);
            }

            // Check for "json" followed by potential JSON start
            const jsonMatch = cleanedResponse.match(/\bjson\s*$/i);
            if (jsonMatch) {
              holdBackLength = Math.max(holdBackLength, jsonMatch[0].length);
            }

            // Check for incomplete code block (opened but not closed)
            const openCodeBlock = cleanedResponse.match(/```[a-z]*\s*[^`]*$/);
            if (openCodeBlock && !cleanedResponse.endsWith("```")) {
              // We're inside an unclosed code block - hold everything after the opening
              holdBackLength = Math.max(holdBackLength, openCodeBlock[0].length);
            }

            // Check for potential JSON object starting
            const jsonObjMatch = cleanedResponse.match(/\{\s*"tool"\s*:\s*"[^"]*"\s*,?\s*$/);
            if (jsonObjMatch) {
              holdBackLength = Math.max(holdBackLength, jsonObjMatch[0].length);
            }

            // Calculate what we can safely emit
            const safeLength = cleanedResponse.length - holdBackLength;

            if (safeLength > emittedLength) {
              const newContent = cleanedResponse.substring(emittedLength, safeLength);
              if (newContent) {
                onToken(newContent);
              }
              emittedLength = safeLength;
            }
          }
          if (chunk.toolCalls && chunk.toolCalls.length > 0) {
            detectedToolCalls = chunk.toolCalls;
          }
        }

        // After streaming is complete, emit any remaining content that isn't a tool call
        const finalCleaned = removeToolCallBlocks(fullResponse);
        if (finalCleaned.length > emittedLength) {
          const remaining = finalCleaned.substring(emittedLength);
          if (remaining.trim()) {
            onToken(remaining);
          }
        }

        // If tool calls detected, handle approval flow
        if (detectedToolCalls.length > 0) {
          onToolCallsDetected?.(detectedToolCalls);

          // Add tool call step to reasoning
          const toolNames = detectedToolCalls.map((tc) => tc.tool).join(", ");
          setReasoningSteps((prev) => [
            ...prev,
            {
              id: `tool-call-${Date.now()}`,
              step: "tool_call",
              description: `Calling tool: ${toolNames}`,
              status: "completed",
            },
          ]);
          reasoning.push(`Calling tool: ${toolNames}`);

          // Add tool calls to the store for approval
          const toolCallIds = detectedToolCalls.map((tc) =>
            addPendingToolCall({
              name: tc.tool,
              description: `Calling ${tc.tool}`,
              args: tc.args,
            })
          );

          // Wait for all tools to be processed
          await new Promise<void>((resolve) => {
            setPendingExecution({
              toolCalls: detectedToolCalls,
              toolCallIds,
              onComplete: async (results) => {
                // Add results to agent conversation
                for (const [toolName, result] of results) {
                  agent.addToolResult(toolName, result);

                  // Add tool result to reasoning steps
                  const resultPreview = result.length > 200
                    ? result.substring(0, 200) + "..."
                    : result;
                  setReasoningSteps((prev) => [
                    ...prev,
                    {
                      id: `tool-result-${toolName}-${Date.now()}`,
                      step: "tool_result",
                      description: `Tool ${toolName} returned:\n${resultPreview}`,
                      status: "completed",
                    },
                  ]);
                  reasoning.push(`Tool ${toolName} returned:\n${resultPreview}`);
                }

                // Continue generation with tool results
                addStep({
                  step: "continue",
                  description: "Processing tool results...",
                });

                const continueStream = agent.continueAfterTools(addStep);

                for await (const chunk of continueStream) {
                  if (!chunk.isComplete && chunk.token) {
                    onToken(chunk.token);
                  }
                }

                resolve();
              },
            });
          });
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
    [getAgent, addPendingToolCall, clearAllToolCalls]
  );

  const resetConversation = useCallback(() => {
    agentRef.current?.reset();
    setReasoningSteps([]);
    setCurrentStep("");
    clearAllToolCalls();
  }, [clearAllToolCalls]);

  return {
    isReady: status === "ready" && engine !== null,
    isProcessing,
    reasoningSteps,
    currentStep,
    processInputWithTools,
    resetConversation,
  };
}
