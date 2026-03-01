import { create } from "zustand";

export interface PendingToolCall {
  id: string;
  name: string;
  description: string;
  args: Record<string, unknown>;
  status: "pending" | "approved" | "rejected" | "executing" | "completed" | "error";
  result?: string;
  error?: string;
  timestamp: Date;
}

interface ToolCallState {
  pendingToolCalls: PendingToolCall[];
  isAwaitingApproval: boolean;
  currentToolCallIndex: number;

  // Actions
  addPendingToolCall: (toolCall: Omit<PendingToolCall, "id" | "status" | "timestamp">) => string;
  approveToolCall: (id: string) => void;
  rejectToolCall: (id: string) => void;
  updateToolCallArgs: (id: string, args: Record<string, unknown>) => void;
  setToolCallExecuting: (id: string) => void;
  setToolCallCompleted: (id: string, result: string) => void;
  setToolCallError: (id: string, error: string) => void;
  clearCompletedToolCalls: () => void;
  clearAllToolCalls: () => void;
  setAwaitingApproval: (awaiting: boolean) => void;
}

let toolCallIdCounter = 0;

export const useToolCallStore = create<ToolCallState>((set, get) => ({
  pendingToolCalls: [],
  isAwaitingApproval: false,
  currentToolCallIndex: 0,

  addPendingToolCall: (toolCall) => {
    const id = `tool-${++toolCallIdCounter}-${Date.now()}`;
    set((state) => ({
      pendingToolCalls: [
        ...state.pendingToolCalls,
        {
          ...toolCall,
          id,
          status: "pending",
          timestamp: new Date(),
        },
      ],
      isAwaitingApproval: true,
    }));
    return id;
  },

  approveToolCall: (id) => {
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.map((tc) =>
        tc.id === id ? { ...tc, status: "approved" } : tc
      ),
    }));
  },

  rejectToolCall: (id) => {
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.map((tc) =>
        tc.id === id ? { ...tc, status: "rejected" } : tc
      ),
      isAwaitingApproval: state.pendingToolCalls.filter(
        (tc) => tc.id !== id && tc.status === "pending"
      ).length > 0,
    }));
  },

  updateToolCallArgs: (id, args) => {
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.map((tc) =>
        tc.id === id ? { ...tc, args: { ...tc.args, ...args } } : tc
      ),
    }));
  },

  setToolCallExecuting: (id) => {
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.map((tc) =>
        tc.id === id ? { ...tc, status: "executing" } : tc
      ),
    }));
  },

  setToolCallCompleted: (id, result) => {
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.map((tc) =>
        tc.id === id ? { ...tc, status: "completed", result } : tc
      ),
      isAwaitingApproval: state.pendingToolCalls.filter(
        (tc) => tc.id !== id && tc.status === "pending"
      ).length > 0,
    }));
  },

  setToolCallError: (id, error) => {
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.map((tc) =>
        tc.id === id ? { ...tc, status: "error", error } : tc
      ),
      isAwaitingApproval: state.pendingToolCalls.filter(
        (tc) => tc.id !== id && tc.status === "pending"
      ).length > 0,
    }));
  },

  clearCompletedToolCalls: () => {
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.filter(
        (tc) => tc.status !== "completed" && tc.status !== "rejected" && tc.status !== "error"
      ),
    }));
  },

  clearAllToolCalls: () => {
    set({
      pendingToolCalls: [],
      isAwaitingApproval: false,
      currentToolCallIndex: 0,
    });
  },

  setAwaitingApproval: (awaiting) => {
    set({ isAwaitingApproval: awaiting });
  },
}));

// Helper to get tool description for display
export const toolDescriptions: Record<string, string> = {
  searchPatients: "Search for patients in the EHR system",
  getPatient: "Retrieve detailed patient information",
  getPatientMedications: "Get patient's medications and history",
  addMedication: "Add a new medication to patient's record",
  getLabResults: "Retrieve patient's lab results",
  getVisitHistory: "Get patient's visit history",
  getVitals: "Retrieve patient's vital signs",
  getVitalsTrend: "Get vital signs trend data for charting",
  addVitalReading: "Record a new vital sign reading",
};

// Helper to format tool arguments for display
export function formatToolArgs(name: string, args: Record<string, unknown>): string {
  const entries = Object.entries(args).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) return "No arguments";

  return entries
    .map(([key, value]) => {
      // Format the key nicely
      const formattedKey = key.replace(/([A-Z])/g, " $1").trim();
      // Format the value
      const formattedValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      return `${formattedKey}: ${formattedValue}`;
    })
    .join(", ");
}
