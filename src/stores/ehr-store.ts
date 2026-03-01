import { create } from "zustand";
import type { ExtendedPatient } from "@/types/ehr";

export type EHRConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

interface EHRState {
  connectionStatus: EHRConnectionStatus;
  selectedPatient: ExtendedPatient | null;
  patients: ExtendedPatient[];
  searchQuery: string;
  isDialogOpen: boolean;
  error: string | null;

  // Actions
  setConnectionStatus: (status: EHRConnectionStatus) => void;
  setSelectedPatient: (patient: ExtendedPatient | null) => void;
  setPatients: (patients: ExtendedPatient[]) => void;
  setSearchQuery: (query: string) => void;
  setDialogOpen: (open: boolean) => void;
  setError: (error: string | null) => void;

  // Complex actions
  connect: () => Promise<void>;
  disconnect: () => void;
  searchPatients: (query: string) => Promise<void>;
  selectPatient: (patient: ExtendedPatient) => void;
  refreshPatientData: () => Promise<void>;
}

export const useEHRStore = create<EHRState>((set, get) => ({
  connectionStatus: "disconnected",
  selectedPatient: null,
  patients: [],
  searchQuery: "",
  isDialogOpen: false,
  error: null,

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  setPatients: (patients) => set({ patients }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDialogOpen: (open) => set({ isDialogOpen: open }),
  setError: (error) => set({ error }),

  connect: async () => {
    set({ connectionStatus: "connecting", error: null });

    try {
      const response = await fetch("/api/ehr/patients");
      if (!response.ok) {
        throw new Error("Failed to connect to EHR");
      }

      const data = await response.json();
      set({
        patients: data.data,
        connectionStatus: "connected",
        isDialogOpen: true,
      });
    } catch (error) {
      set({
        connectionStatus: "error",
        error: error instanceof Error ? error.message : "Connection failed",
      });
    }
  },

  disconnect: () => {
    set({
      connectionStatus: "disconnected",
      selectedPatient: null,
      patients: [],
      searchQuery: "",
      error: null,
    });
  },

  searchPatients: async (query) => {
    set({ searchQuery: query });

    if (!query.trim()) {
      // If empty query, fetch all patients
      try {
        const response = await fetch("/api/ehr/patients");
        if (response.ok) {
          const data = await response.json();
          set({ patients: data.data });
        }
      } catch {
        // Ignore errors on empty search
      }
      return;
    }

    try {
      const response = await fetch(
        `/api/ehr/patients?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        set({ patients: data.data });
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  },

  selectPatient: (patient) => {
    set({
      selectedPatient: patient,
      isDialogOpen: false,
      connectionStatus: "connected",
    });
  },

  refreshPatientData: async () => {
    const { selectedPatient } = get();
    if (!selectedPatient) return;

    try {
      const response = await fetch(`/api/ehr/patients/${selectedPatient.id}`);
      if (response.ok) {
        const data = await response.json();
        set({ selectedPatient: data.data });
      }
    } catch (error) {
      console.error("Failed to refresh patient data:", error);
    }
  },
}));
