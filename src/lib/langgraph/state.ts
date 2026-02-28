import { Annotation } from "@langchain/langgraph";
import type { PatientContext, Medication, LabResult, EHRSummary, Attachment } from "@/types";

// Define the state schema for the medical agent
export const MedicalAgentState = Annotation.Root({
  // User input
  userMessage: Annotation<string>,
  attachments: Annotation<Attachment[]>({
    default: () => [],
    reducer: (current, update) => update ?? current,
  }),

  // Patient context
  patientContext: Annotation<PatientContext | null>({
    default: () => null,
    reducer: (current, update) => update ?? current,
  }),

  // Processing state
  currentStep: Annotation<string>({
    default: () => "",
    reducer: (_, update) => update,
  }),
  reasoning: Annotation<string[]>({
    default: () => [],
    reducer: (current, update) => [...current, ...update],
  }),

  // Extracted information
  extractedMedications: Annotation<Medication[]>({
    default: () => [],
    reducer: (current, update) => [...current, ...update],
  }),
  extractedLabResults: Annotation<LabResult[]>({
    default: () => [],
    reducer: (current, update) => [...current, ...update],
  }),
  extractedNotes: Annotation<string[]>({
    default: () => [],
    reducer: (current, update) => [...current, ...update],
  }),

  // Output
  response: Annotation<string>({
    default: () => "",
    reducer: (_, update) => update,
  }),
  ehrSummary: Annotation<EHRSummary | null>({
    default: () => null,
    reducer: (_, update) => update,
  }),
});

export type MedicalAgentStateType = typeof MedicalAgentState.State;
