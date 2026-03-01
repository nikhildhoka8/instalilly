"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebLLM, useChatAgentWithTools } from "@/hooks";
import { useChatStore } from "@/stores/chat-store";
import { useEHRStore } from "@/stores/ehr-store";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  EHRConnectorMenuItem,
  EHRConnectionBadge,
  PatientSelectionDialog,
  ToolApprovalPanel,
} from "@/components/ehr";
import { useToolCallStore } from "@/stores/tool-call-store";
import { ModelStatus } from "./ModelStatus";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { Stethoscope, Mic } from "lucide-react";
import type { Attachment as AttachmentType } from "@/types";

function AttachmentsDisplay() {
  const { files, remove } = usePromptInputAttachments();

  if (files.length === 0) return null;

  return (
    <Attachments variant="grid" className="mb-2">
      {files.map((file) => (
        <Attachment key={file.id} data={file} onRemove={() => remove(file.id)}>
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

export function ChatContainer() {
  const { initialize, isReady, status: modelStatus } = useWebLLM();
  const { processInputWithTools, isProcessing, reasoningSteps } = useChatAgentWithTools();
  const { messages, status, addMessage, updateMessage, setStatus, clearConversation } = useChatStore();
  const { selectedPatient } = useEHRStore();
  const { pendingToolCalls, isAwaitingApproval } = useToolCallStore();
  const [inputValue, setInputValue] = useState("");
  const [streamingContent, setStreamingContent] = useState("");

  // Check if there are completed vitals trend tool calls that need to show charts
  const hasCompletedVitalsChart = pendingToolCalls.some(
    (tc) => tc.name === "getVitalsTrend" && tc.status === "completed" && tc.result
  );

  // Initialize model on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      if (!message.text.trim() && message.files.length === 0) return;
      if (!isReady) return;

      // Add user message
      addMessage({
        role: "user",
        content: message.text,
        attachments: message.files.map((f) => ({
          id: f.url,
          type: f.mediaType?.startsWith("image/")
            ? "image"
            : f.mediaType?.startsWith("video/")
            ? "video"
            : "document",
          filename: f.filename || "file",
          url: f.url,
          mediaType: f.mediaType || "application/octet-stream",
        })) as AttachmentType[],
      });

      setStatus("streaming");
      setInputValue("");
      setStreamingContent("");

      // Create placeholder assistant message for streaming
      const assistantMessageId = addMessage({
        role: "assistant",
        content: "",
      });

      try {
        // Build patient context if connected
        const patientContext = selectedPatient
          ? {
              patient: {
                id: selectedPatient.id,
                name: selectedPatient.name,
                dateOfBirth: selectedPatient.dateOfBirth,
                mrn: selectedPatient.mrn,
                allergies: selectedPatient.allergies,
                currentMedications: selectedPatient.currentMedications,
                conditions: selectedPatient.conditions,
                lastVisit: selectedPatient.lastVisit,
              },
            }
          : null;

        // Process with streaming and tool support
        const result = await processInputWithTools(
          message.text,
          message.files.map((f) => ({
            id: f.url,
            type: f.mediaType?.startsWith("image/")
              ? "image"
              : f.mediaType?.startsWith("video/")
              ? "video"
              : "document",
            filename: f.filename || "file",
            url: f.url,
            mediaType: f.mediaType || "application/octet-stream",
          })) as AttachmentType[],
          patientContext,
          (token) => {
            // Update streaming content and message on each token
            setStreamingContent((prev) => {
              const newContent = prev + token;
              updateMessage(assistantMessageId, { content: newContent });
              return newContent;
            });
          },
          (toolCalls) => {
            // Tool calls detected - the approval panel will show
            console.log("Tool calls detected:", toolCalls);
          }
        );

        // Update final message with reasoning
        updateMessage(assistantMessageId, {
          reasoning: result.reasoning,
        });

        setStatus("idle");
        setStreamingContent("");
      } catch (error) {
        console.error("Error processing message:", error);
        updateMessage(assistantMessageId, {
          content: "I encountered an error processing your request. Please try again.",
        });
        setStatus("error");
        setStreamingContent("");
      }
    },
    [isReady, addMessage, updateMessage, setStatus, processInputWithTools, selectedPatient]
  );

  const handleSuggestionSelect = useCallback((prompt: string) => {
    setInputValue(prompt);
  }, []);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Stethoscope className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">AgentMD</h1>
              <p className="text-xs text-muted-foreground">
                Pre-visit data extraction assistant
              </p>
            </div>
          </div>
          <ModelStatus />
        </div>
      </header>

      {/* Conversation */}
      <Conversation className="flex-1">
        <ConversationContent>
          {isEmpty ? (
            <ConversationEmptyState>
              <SuggestedPrompts onSelect={handleSuggestionSelect} />
            </ConversationEmptyState>
          ) : (
            messages.map((msg, index) => {
              const isLastMessage = index === messages.length - 1;
              const isStreamingMessage = isLastMessage && msg.role === "assistant" && isProcessing;

              return (
                <Message key={msg.id} from={msg.role}>
                  <MessageContent>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <Attachments variant="grid" className="mb-2">
                        {msg.attachments.map((att) => (
                          <Attachment
                            key={att.id}
                            data={{
                              id: att.id,
                              type: "file",
                              filename: att.filename,
                              url: att.url,
                              mediaType: att.mediaType,
                            }}
                          >
                            <AttachmentPreview />
                          </Attachment>
                        ))}
                      </Attachments>
                    )}
                    {/* Show live reasoning steps for streaming message */}
                    {isStreamingMessage && reasoningSteps.length > 0 && (
                      <Reasoning className="mb-2" isStreaming defaultOpen>
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {reasoningSteps.map((step) => step.description).join("\n\n")}
                        </ReasoningContent>
                      </Reasoning>
                    )}
                    {/* Show saved reasoning for completed messages */}
                    {!isStreamingMessage && msg.reasoning && msg.reasoning.length > 0 && (
                      <Reasoning className="mb-2" defaultOpen={false}>
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {msg.reasoning.join("\n\n")}
                        </ReasoningContent>
                      </Reasoning>
                    )}
                    <MessageResponse>{msg.content}</MessageResponse>
                  </MessageContent>
                </Message>
              );
            })
          )}

          {/* Tool Approval Panel - shows pending tool calls and completed charts */}
          {(isAwaitingApproval || hasCompletedVitalsChart) && <ToolApprovalPanel />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input */}
      <div className="border-t bg-background p-4">
        <PromptInput
          onSubmit={handleSubmit}
          accept="image/*,video/*,application/pdf"
          multiple
          className="mx-auto max-w-3xl"
        >
          <EHRConnectionBadge />
          <AttachmentsDisplay />
          <PromptInputTextarea
            placeholder={
              isReady
                ? "Describe what you need or upload patient documents..."
                : "Loading AI model..."
            }
            disabled={!isReady}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger
                  tooltip="Add attachments"
                  disabled={!isReady}
                />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments label="Add images or documents" />
                  <DropdownMenuSeparator />
                  <EHRConnectorMenuItem />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton tooltip="Voice input (coming soon)" disabled>
                <Mic className="size-4" />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit
              status={status === "streaming" ? "streaming" : undefined}
              disabled={!isReady || isProcessing}
            />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI runs locally in your browser. Patient data never leaves your device.
        </p>
      </div>

      {/* EHR Patient Selection Dialog */}
      <PatientSelectionDialog />
    </div>
  );
}
