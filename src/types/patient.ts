export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  mrn: string;
  allergies: string[];
  currentMedications: Medication[];
  conditions: string[];
  lastVisit: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface LabResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "critical";
  date: string;
}

export interface PatientContext {
  patient: Patient | null;
  visitReason?: string;
}

export interface EHRSummary {
  patientId: string;
  summaryDate: string;
  chiefComplaint?: string;
  medications: Medication[];
  labResults: LabResult[];
  notes: string[];
  recommendations: string[];
}
