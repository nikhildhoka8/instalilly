export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  reasoning?: string[];
  timestamp: Date;
}

export interface Attachment {
  id: string;
  type: "image" | "video" | "document" | "audio";
  filename: string;
  url: string;
  mediaType: string;
  processedContent?: string;
}

export type ChatStatus = "idle" | "submitted" | "streaming" | "error";

export interface ReasoningStep {
  id: string;
  step: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "error";
}
