// EHR (Electronic Health Record) type definitions

export interface Visit {
  id: string;
  date: string;
  type: "office" | "telehealth" | "emergency" | "followup";
  chiefComplaint: string;
  diagnosis?: string[];
  notes?: string;
  providerId: string;
}

export interface DrugHistory {
  id: string;
  medicationName: string;
  startDate: string;
  endDate?: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  reason: string;
  discontinuedReason?: string;
}

export interface EHRLabResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "critical";
}

export interface LabReport {
  id: string;
  orderId: string;
  orderDate: string;
  collectionDate: string;
  reportDate: string;
  orderingProvider: string;
  labName: string;
  results: EHRLabResult[];
  status: "pending" | "completed" | "cancelled";
}

export interface VitalReading {
  id: string;
  date: string;
  type: "blood_pressure" | "heart_rate" | "temperature" | "weight" | "oxygen_saturation" | "respiratory_rate";
  value: string;
  systolic?: number;
  diastolic?: number;
  numericValue?: number;
  unit: string;
  source: "clinic" | "home" | "hospital" | "device";
  notes?: string;
}

export interface ExtendedPatient {
  id: string;
  name: string;
  dateOfBirth: string;
  mrn: string;
  gender: "male" | "female" | "other";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phoneNumber: string;
  email?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  primaryCareProvider: string;
  allergies: string[];
  conditions: string[];
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  drugHistory: DrugHistory[];
  visits: Visit[];
  labReports: LabReport[];
  vitals: VitalReading[];
  lastVisit: string;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  npi: string;
}

export interface EHRDatabase {
  version: string;
  lastUpdated: string;
  patients: ExtendedPatient[];
  providers: Provider[];
}

// MCP Tool types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface MCPToolResponse {
  tools: MCPTool[];
}

export interface MCPToolCallRequest {
  method: string;
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface MCPToolCallResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}
