"use client";

import { useToolCallStore, toolDescriptions } from "@/stores/tool-call-store";
import { Button } from "@/components/ui/button";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { VitalsChartToolOutput } from "./VitalsChartToolOutput";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ToolUIPart } from "ai";

// Map our internal status to the Tool component's state
function mapStatusToToolState(
  status: string
): ToolUIPart["state"] {
  switch (status) {
    case "pending":
      return "approval-requested";
    case "approved":
      return "input-available";
    case "rejected":
      return "output-denied";
    case "executing":
      return "input-available";
    case "completed":
      return "output-available";
    case "error":
      return "output-error";
    default:
      return "input-streaming";
  }
}

export function ToolApprovalPanel() {
  const { pendingToolCalls, approveToolCall, rejectToolCall } = useToolCallStore();

  const pendingCalls = pendingToolCalls.filter((tc) => tc.status === "pending");
  const otherCalls = pendingToolCalls.filter((tc) => tc.status !== "pending");

  if (pendingToolCalls.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3 py-4">
      <AnimatePresence>
        {/* Pending tool calls that need approval */}
        {pendingCalls.map((toolCall) => {
          const toolState = mapStatusToToolState(toolCall.status);

          return (
            <motion.div
              key={toolCall.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Tool defaultOpen={true}>
                <ToolHeader
                  type="dynamic-tool"
                  toolName={toolCall.name}
                  state={toolState}
                  title={toolDescriptions[toolCall.name] || toolCall.name}
                />
                <ToolContent>
                  <ToolInput input={toolCall.args} />

                  {/* Approval buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => approveToolCall(toolCall.id)}
                      className="flex-1 gap-1"
                    >
                      <CheckCircle2 className="size-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectToolCall(toolCall.id)}
                      className="flex-1 gap-1"
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                  </div>
                </ToolContent>
              </Tool>
            </motion.div>
          );
        })}

        {/* Completed/rejected/executing tool calls */}
        {otherCalls.map((toolCall) => {
          const toolState = mapStatusToToolState(toolCall.status);

          return (
            <motion.div
              key={toolCall.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Tool defaultOpen={toolCall.status === "executing" || toolCall.status === "error" || (toolCall.name === "getVitalsTrend" && toolCall.status === "completed")}>
                <ToolHeader
                  type="dynamic-tool"
                  toolName={toolCall.name}
                  state={toolState}
                  title={toolDescriptions[toolCall.name] || toolCall.name}
                />
                <ToolContent>
                  <ToolInput input={toolCall.args} />
                  <ToolOutput
                    output={toolCall.result}
                    errorText={toolCall.error}
                  />
                  <VitalsChartToolOutput
                    toolName={toolCall.name}
                    result={toolCall.result}
                  />
                </ToolContent>
              </Tool>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Simpler inline version for showing tool calls within messages
export function ToolCallDisplay({
  name,
  args,
  status,
  result,
  error,
  onApprove,
  onReject,
}: {
  name: string;
  args: Record<string, unknown>;
  status: string;
  result?: string;
  error?: string;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const toolState = mapStatusToToolState(status);
  const showApprovalButtons = status === "pending" && onApprove && onReject;

  return (
    <Tool defaultOpen={status === "pending" || status === "executing"}>
      <ToolHeader
        type="dynamic-tool"
        toolName={name}
        state={toolState}
        title={toolDescriptions[name] || name}
      />
      <ToolContent>
        <ToolInput input={args} />

        {showApprovalButtons && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={onApprove} className="flex-1 gap-1">
              <CheckCircle2 className="size-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              className="flex-1 gap-1"
            >
              <XCircle className="size-4" />
              Reject
            </Button>
          </div>
        )}

        <ToolOutput output={result} errorText={error} />
        <VitalsChartToolOutput toolName={name} result={result} />
      </ToolContent>
    </Tool>
  );
}

// Export for convenience
export { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput, getStatusBadge } from "@/components/ai-elements/tool";
