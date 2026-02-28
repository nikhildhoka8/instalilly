import { create } from "zustand";
import type { ChatMessage, ChatStatus, ReasoningStep, Attachment } from "@/types";
import { nanoid } from "nanoid";

interface ChatState {
  messages: ChatMessage[];
  status: ChatStatus;
  currentInput: string;
  attachments: Attachment[];
  reasoningSteps: ReasoningStep[];

  // Actions
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setStatus: (status: ChatStatus) => void;
  setInput: (input: string) => void;
  addAttachment: (attachment: Omit<Attachment, "id">) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  setReasoningSteps: (steps: ReasoningStep[]) => void;
  addReasoningStep: (step: Omit<ReasoningStep, "id">) => void;
  clearReasoningSteps: () => void;
  clearConversation: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  status: "idle",
  currentInput: "",
  attachments: [],
  reasoningSteps: [],

  addMessage: (message) => {
    const id = nanoid();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id,
          timestamp: new Date(),
        },
      ],
    }));
    return id;
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  setStatus: (status) => set({ status }),

  setInput: (currentInput) => set({ currentInput }),

  addAttachment: (attachment) => {
    const id = nanoid();
    set((state) => ({
      attachments: [...state.attachments, { ...attachment, id }],
    }));
  },

  removeAttachment: (id) => {
    set((state) => ({
      attachments: state.attachments.filter((a) => a.id !== id),
    }));
  },

  clearAttachments: () => set({ attachments: [] }),

  setReasoningSteps: (reasoningSteps) => set({ reasoningSteps }),

  addReasoningStep: (step) => {
    const id = nanoid();
    set((state) => ({
      reasoningSteps: [...state.reasoningSteps, { ...step, id }],
    }));
  },

  clearReasoningSteps: () => set({ reasoningSteps: [] }),

  clearConversation: () =>
    set({
      messages: [],
      status: "idle",
      currentInput: "",
      attachments: [],
      reasoningSteps: [],
    }),
}));
