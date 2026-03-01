import { tool } from "@langchain/core/tools";
import { z } from "zod";

// EHR Tool definitions using LangChain's tool() function
// These tools call the EHR API endpoints and return structured data

const API_BASE = "/api/ehr";

async function fetchEHR(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`EHR API error: ${response.statusText}`);
  }
  return response.json();
}

// Tool: Search Patients
export const searchPatientsTool = tool(
  async ({ query }) => {
    const result = await fetchEHR(`/patients?q=${encodeURIComponent(query)}`);
    if (!result.success) return `Error: ${result.error}`;

    if (result.data.length === 0) {
      return "No patients found matching the search criteria.";
    }

    return result.data.map((p: { name: string; mrn: string; dateOfBirth: string; conditions: string[] }) =>
      `- ${p.name} (MRN: ${p.mrn}, DOB: ${p.dateOfBirth}, Conditions: ${p.conditions.join(", ") || "None"})`
    ).join("\n");
  },
  {
    name: "searchPatients",
    description: "Search for patients by name, MRN (medical record number), or date of birth",
    schema: z.object({
      query: z.string().describe("Search query - can be patient name, MRN, or date of birth"),
    }),
  }
);

// Tool: Get Patient Details
export const getPatientTool = tool(
  async ({ patientId }) => {
    const result = await fetchEHR(`/patients/${patientId}`);
    if (!result.success) return `Error: Patient not found`;

    const p = result.data;
    return `Patient: ${p.name}
MRN: ${p.mrn}
DOB: ${p.dateOfBirth} (${p.gender})
Phone: ${p.phoneNumber}
Address: ${p.address.street}, ${p.address.city}, ${p.address.state} ${p.address.zipCode}

Allergies: ${p.allergies.join(", ") || "None"}
Conditions: ${p.conditions.join(", ") || "None"}

Current Medications:
${p.currentMedications.map((m: { name: string; dosage: string; frequency: string }) => `  - ${m.name} ${m.dosage} (${m.frequency})`).join("\n")}

Primary Care Provider: ${p.primaryCareProvider}
Last Visit: ${p.lastVisit}`;
  },
  {
    name: "getPatient",
    description: "Get detailed information about a specific patient by their ID",
    schema: z.object({
      patientId: z.string().describe("The patient's unique identifier (e.g., 'pat-001')"),
    }),
  }
);

// Tool: Get Patient Medications
export const getPatientMedicationsTool = tool(
  async ({ patientId, includeHistory }) => {
    const historyParam = includeHistory ? "?history=true" : "";
    const result = await fetchEHR(`/patients/${patientId}/medications${historyParam}`);
    if (!result.success) return `Error: ${result.error}`;

    const { currentMedications, drugHistory } = result.data;

    let response = `Current Medications:\n${currentMedications.map(
      (m: { name: string; dosage: string; frequency: string }) => `  - ${m.name} ${m.dosage} (${m.frequency})`
    ).join("\n")}`;

    if (includeHistory && drugHistory) {
      response += `\n\nMedication History:\n${drugHistory.map(
        (m: { medicationName: string; dosage: string; startDate: string; endDate?: string; reason: string; discontinuedReason?: string }) =>
          `  - ${m.medicationName} ${m.dosage}: ${m.startDate}${m.endDate ? ` to ${m.endDate} (Discontinued: ${m.discontinuedReason})` : " (Active)"} - ${m.reason}`
      ).join("\n")}`;
    }

    return response;
  },
  {
    name: "getPatientMedications",
    description: "Get a patient's current medications and optionally their full medication history",
    schema: z.object({
      patientId: z.string().describe("The patient's unique identifier"),
      includeHistory: z.boolean().optional().describe("Whether to include the full medication history"),
    }),
  }
);

// Tool: Add Medication
export const addMedicationTool = tool(
  async ({ patientId, medicationName, dosage, frequency, prescribedBy, reason, startDate }) => {
    const result = await fetchEHR(`/patients/${patientId}/medications`, {
      method: "POST",
      body: JSON.stringify({
        medicationName,
        dosage,
        frequency,
        prescribedBy,
        reason,
        startDate,
      }),
    });

    if (!result.success) return `Error: ${result.error}`;
    return `Successfully added ${medicationName} ${dosage} to patient's medications.`;
  },
  {
    name: "addMedication",
    description: "Add a new medication to a patient's record",
    schema: z.object({
      patientId: z.string().describe("The patient's unique identifier"),
      medicationName: z.string().describe("Name of the medication"),
      dosage: z.string().describe("Dosage (e.g., '500mg', '10mg')"),
      frequency: z.string().describe("Frequency (e.g., 'twice daily', 'once daily at bedtime')"),
      prescribedBy: z.string().describe("Provider ID who prescribed the medication"),
      reason: z.string().describe("Reason for the medication"),
      startDate: z.string().describe("Start date in YYYY-MM-DD format"),
    }),
  }
);

// Tool: Get Lab Results
export const getLabResultsTool = tool(
  async ({ patientId, startDate, endDate }) => {
    let endpoint = `/patients/${patientId}/labs`;
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const result = await fetchEHR(endpoint);
    if (!result.success) return `Error: ${result.error}`;

    if (result.data.length === 0) {
      return "No lab results found for the specified criteria.";
    }

    return result.data.map((lab: {
      reportDate: string;
      labName: string;
      orderingProvider: string;
      status: string;
      results: Array<{ name: string; value: string; unit: string; referenceRange: string; status: string }>;
    }) => {
      const resultLines = lab.results.map(r => {
        const flag = r.status !== "normal" ? ` [${r.status.toUpperCase()}]` : "";
        return `    - ${r.name}: ${r.value} ${r.unit} (Ref: ${r.referenceRange})${flag}`;
      }).join("\n");

      return `Lab Report (${lab.reportDate}) - ${lab.labName}
  Status: ${lab.status}
  Ordered by: ${lab.orderingProvider}
  Results:
${resultLines}`;
    }).join("\n\n");
  },
  {
    name: "getLabResults",
    description: "Get lab results for a patient, optionally filtered by date range",
    schema: z.object({
      patientId: z.string().describe("The patient's unique identifier"),
      startDate: z.string().optional().describe("Filter results from this date (YYYY-MM-DD)"),
      endDate: z.string().optional().describe("Filter results until this date (YYYY-MM-DD)"),
    }),
  }
);

// Tool: Get Visit History
export const getVisitHistoryTool = tool(
  async ({ patientId, limit }) => {
    let endpoint = `/patients/${patientId}/visits`;
    if (limit) endpoint += `?limit=${limit}`;

    const result = await fetchEHR(endpoint);
    if (!result.success) return `Error: ${result.error}`;

    if (result.data.length === 0) {
      return "No visit history found.";
    }

    return result.data.map((visit: {
      date: string;
      type: string;
      chiefComplaint: string;
      diagnosis?: string[];
      notes?: string;
      providerId: string;
    }) =>
      `${visit.date} - ${visit.type.toUpperCase()}
  Chief Complaint: ${visit.chiefComplaint}
  ${visit.diagnosis ? `Diagnosis: ${visit.diagnosis.join(", ")}` : ""}
  ${visit.notes ? `Notes: ${visit.notes}` : ""}
  Provider: ${visit.providerId}`
    ).join("\n\n");
  },
  {
    name: "getVisitHistory",
    description: "Get visit history for a patient",
    schema: z.object({
      patientId: z.string().describe("The patient's unique identifier"),
      limit: z.number().optional().describe("Maximum number of visits to return"),
    }),
  }
);

// Tool: Get Vitals
export const getVitalsTool = tool(
  async ({ patientId, vitalType, startDate, endDate }) => {
    let endpoint = `/patients/${patientId}/vitals`;
    const params = new URLSearchParams();
    if (vitalType) params.append("type", vitalType);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const result = await fetchEHR(endpoint);
    if (!result.success) return `Error: ${result.error}`;

    if (result.data.length === 0) {
      return "No vital signs found for the specified criteria.";
    }

    return result.data.map((vital: {
      date: string;
      type: string;
      value: string;
      unit: string;
      source: string;
      notes?: string;
    }) =>
      `${vital.date}: ${vital.type.replace("_", " ")} = ${vital.value} ${vital.unit} (${vital.source})${vital.notes ? ` - ${vital.notes}` : ""}`
    ).join("\n");
  },
  {
    name: "getVitals",
    description: "Get vital signs history for a patient",
    schema: z.object({
      patientId: z.string().describe("The patient's unique identifier"),
      vitalType: z.enum([
        "blood_pressure",
        "heart_rate",
        "temperature",
        "weight",
        "oxygen_saturation",
        "respiratory_rate"
      ]).optional().describe("Type of vital sign to retrieve"),
      startDate: z.string().optional().describe("Filter from this date (YYYY-MM-DD)"),
      endDate: z.string().optional().describe("Filter until this date (YYYY-MM-DD)"),
    }),
  }
);

// Tool: Get Vitals Trend (for charting)
export const getVitalsTrendTool = tool(
  async ({ patientId, vitalType, startDate, endDate }) => {
    let endpoint = `/patients/${patientId}/vitals?trend=true&type=${vitalType}`;
    if (startDate) endpoint += `&startDate=${startDate}`;
    if (endDate) endpoint += `&endDate=${endDate}`;

    const result = await fetchEHR(endpoint);
    if (!result.success) return `Error: ${result.error}`;

    const trend = result.data;
    return JSON.stringify({
      type: "vitals_chart",
      data: trend,
    });
  },
  {
    name: "getVitalsTrend",
    description: "Get vital signs data formatted for visualization/charting. Use this when the user asks to see trends or graphs.",
    schema: z.object({
      patientId: z.string().describe("The patient's unique identifier"),
      vitalType: z.enum([
        "blood_pressure",
        "heart_rate",
        "temperature",
        "weight",
        "oxygen_saturation",
        "respiratory_rate"
      ]).describe("Type of vital sign to chart"),
      startDate: z.string().optional().describe("Start date for the trend (YYYY-MM-DD)"),
      endDate: z.string().optional().describe("End date for the trend (YYYY-MM-DD)"),
    }),
  }
);

// Tool: Add Vital Reading
export const addVitalReadingTool = tool(
  async ({ patientId, date, type, value, systolic, diastolic, numericValue, unit, source, notes }) => {
    const result = await fetchEHR(`/patients/${patientId}/vitals`, {
      method: "POST",
      body: JSON.stringify({
        date,
        type,
        value,
        systolic,
        diastolic,
        numericValue,
        unit,
        source,
        notes,
      }),
    });

    if (!result.success) return `Error: ${result.error}`;
    return `Successfully recorded ${type.replace("_", " ")}: ${value} ${unit}`;
  },
  {
    name: "addVitalReading",
    description: "Add a new vital reading for a patient",
    schema: z.object({
      patientId: z.string().describe("The patient's unique identifier"),
      date: z.string().describe("Date of the reading (ISO timestamp or YYYY-MM-DD)"),
      type: z.enum([
        "blood_pressure",
        "heart_rate",
        "temperature",
        "weight",
        "oxygen_saturation",
        "respiratory_rate"
      ]).describe("Type of vital sign"),
      value: z.string().describe("Value as string (e.g., '120/80' for BP, '72' for HR)"),
      systolic: z.number().optional().describe("Systolic value for blood pressure"),
      diastolic: z.number().optional().describe("Diastolic value for blood pressure"),
      numericValue: z.number().optional().describe("Numeric value for other vitals"),
      unit: z.string().describe("Unit of measurement (mmHg, bpm, °F, lbs, %, breaths/min)"),
      source: z.enum(["clinic", "home", "hospital", "device"]).describe("Source of the reading"),
      notes: z.string().optional().describe("Additional notes"),
    }),
  }
);

// Export all tools as an array
export const ehrTools = [
  searchPatientsTool,
  getPatientTool,
  getPatientMedicationsTool,
  addMedicationTool,
  getLabResultsTool,
  getVisitHistoryTool,
  getVitalsTool,
  getVitalsTrendTool,
  addVitalReadingTool,
];

// Export tool type for TypeScript
export type EHRTool = typeof ehrTools[number];
