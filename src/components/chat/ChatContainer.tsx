"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebLLM, useChatAgent } from "@/hooks";
import { useChatStore } from "@/stores/chat-store";
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
import { ModelStatus } from "./ModelStatus";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { Stethoscope, Mic, ImageIcon, Video } from "lucide-react";
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
  const { processInput, isProcessing, reasoningSteps } = useChatAgent();
  const { messages, status, addMessage, setStatus, clearConversation } = useChatStore();
  const [inputValue, setInputValue] = useState("");

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

      try {
        // Process with agent
        const result = await processInput(
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
          })) as AttachmentType[]
        );

        // Add assistant response
        addMessage({
          role: "assistant",
          content: result.response,
          reasoning: result.reasoning,
        });

        setStatus("idle");
      } catch (error) {
        console.error("Error processing message:", error);
        addMessage({
          role: "assistant",
          content: "I encountered an error processing your request. Please try again.",
        });
        setStatus("error");
      }
    },
    [isReady, addMessage, setStatus, processInput]
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
            messages.map((msg) => (
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
                  {msg.reasoning && msg.reasoning.length > 0 && (
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
            ))
          )}

          {/* Show reasoning steps during processing */}
          {isProcessing && reasoningSteps.length > 0 && (
            <Message from="assistant">
              <MessageContent>
                <Reasoning isStreaming>
                  <ReasoningTrigger />
                  <ReasoningContent>
                    {reasoningSteps.map((step) => step.description).join("\n\n")}
                  </ReasoningContent>
                </Reasoning>
              </MessageContent>
            </Message>
          )}
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
    </div>
  );
}
