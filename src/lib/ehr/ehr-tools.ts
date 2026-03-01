import type { MCPTool } from "@/types/ehr";

export const ehrTools: MCPTool[] = [
  {
    name: "searchPatients",
    description: "Search for patients by name, MRN, or date of birth",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (name, MRN, or date of birth)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "getPatient",
    description: "Get detailed patient information by patient ID",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
      },
      required: ["patientId"],
    },
  },
  {
    name: "getPatientMedications",
    description:
      "Get a patient's current medications and optionally their full drug history",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        includeHistory: {
          type: "boolean",
          description: "Whether to include the full medication history",
        },
      },
      required: ["patientId"],
    },
  },
  {
    name: "addMedication",
    description: "Add a new medication to a patient's record",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        medicationName: {
          type: "string",
          description: "Name of the medication",
        },
        dosage: {
          type: "string",
          description: "Dosage (e.g., '500mg')",
        },
        frequency: {
          type: "string",
          description: "Frequency (e.g., 'twice daily')",
        },
        prescribedBy: {
          type: "string",
          description: "Provider ID who prescribed the medication",
        },
        reason: {
          type: "string",
          description: "Reason for the medication",
        },
        startDate: {
          type: "string",
          description: "Start date (YYYY-MM-DD format)",
        },
      },
      required: [
        "patientId",
        "medicationName",
        "dosage",
        "frequency",
        "prescribedBy",
        "reason",
        "startDate",
      ],
    },
  },
  {
    name: "discontinueMedication",
    description: "Discontinue a medication for a patient",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        medicationId: {
          type: "string",
          description: "The medication's unique identifier",
        },
        reason: {
          type: "string",
          description: "Reason for discontinuation",
        },
      },
      required: ["patientId", "medicationId", "reason"],
    },
  },
  {
    name: "getLabResults",
    description: "Get lab results for a patient with optional date filtering",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        startDate: {
          type: "string",
          description: "Filter results from this date (YYYY-MM-DD)",
        },
        endDate: {
          type: "string",
          description: "Filter results until this date (YYYY-MM-DD)",
        },
      },
      required: ["patientId"],
    },
  },
  {
    name: "addLabReport",
    description: "Add a new lab report to a patient's record",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        orderId: {
          type: "string",
          description: "Lab order ID",
        },
        orderDate: {
          type: "string",
          description: "Date the lab was ordered (YYYY-MM-DD)",
        },
        collectionDate: {
          type: "string",
          description: "Date the sample was collected (YYYY-MM-DD)",
        },
        reportDate: {
          type: "string",
          description: "Date the report was finalized (YYYY-MM-DD)",
        },
        orderingProvider: {
          type: "string",
          description: "Provider ID who ordered the lab",
        },
        labName: {
          type: "string",
          description: "Name of the lab facility",
        },
        status: {
          type: "string",
          enum: ["pending", "completed", "cancelled"],
          description: "Status of the lab report",
        },
        results: {
          type: "array",
          description: "Array of lab result objects",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              value: { type: "string" },
              unit: { type: "string" },
              referenceRange: { type: "string" },
              status: {
                type: "string",
                enum: ["normal", "high", "low", "critical"],
              },
            },
          },
        },
      },
      required: [
        "patientId",
        "orderId",
        "orderDate",
        "collectionDate",
        "reportDate",
        "orderingProvider",
        "labName",
        "status",
        "results",
      ],
    },
  },
  {
    name: "getVisitHistory",
    description: "Get visit history for a patient",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        limit: {
          type: "number",
          description: "Maximum number of visits to return",
        },
      },
      required: ["patientId"],
    },
  },
  {
    name: "addVisit",
    description: "Record a new visit for a patient",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        date: {
          type: "string",
          description: "Visit date (YYYY-MM-DD)",
        },
        type: {
          type: "string",
          enum: ["office", "telehealth", "emergency", "followup"],
          description: "Type of visit",
        },
        chiefComplaint: {
          type: "string",
          description: "Main reason for the visit",
        },
        diagnosis: {
          type: "array",
          items: { type: "string" },
          description: "Diagnoses made during the visit",
        },
        notes: {
          type: "string",
          description: "Clinical notes",
        },
        providerId: {
          type: "string",
          description: "Provider ID who conducted the visit",
        },
      },
      required: ["patientId", "date", "type", "chiefComplaint", "providerId"],
    },
  },
  {
    name: "getVitals",
    description:
      "Get vital signs history for a patient with optional type and date filtering",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        vitalType: {
          type: "string",
          enum: [
            "blood_pressure",
            "heart_rate",
            "temperature",
            "weight",
            "oxygen_saturation",
            "respiratory_rate",
          ],
          description: "Type of vital sign to retrieve",
        },
        startDate: {
          type: "string",
          description: "Filter from this date (YYYY-MM-DD)",
        },
        endDate: {
          type: "string",
          description: "Filter until this date (YYYY-MM-DD)",
        },
      },
      required: ["patientId"],
    },
  },
  {
    name: "addVitalReading",
    description: "Add a new vital reading for a patient",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        date: {
          type: "string",
          description: "Date of the reading (ISO timestamp or YYYY-MM-DD)",
        },
        type: {
          type: "string",
          enum: [
            "blood_pressure",
            "heart_rate",
            "temperature",
            "weight",
            "oxygen_saturation",
            "respiratory_rate",
          ],
          description: "Type of vital sign",
        },
        value: {
          type: "string",
          description: "Value as string (e.g., '120/80' for BP, '72' for HR)",
        },
        systolic: {
          type: "number",
          description: "Systolic value for blood pressure",
        },
        diastolic: {
          type: "number",
          description: "Diastolic value for blood pressure",
        },
        numericValue: {
          type: "number",
          description: "Numeric value for other vitals",
        },
        unit: {
          type: "string",
          description: "Unit of measurement",
        },
        source: {
          type: "string",
          enum: ["clinic", "home", "hospital", "device"],
          description: "Source of the reading",
        },
        notes: {
          type: "string",
          description: "Additional notes",
        },
      },
      required: ["patientId", "date", "type", "value", "unit", "source"],
    },
  },
  {
    name: "getVitalsTrend",
    description:
      "Get vital signs data formatted for visualization/charting with reference ranges",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient's unique identifier",
        },
        vitalType: {
          type: "string",
          enum: [
            "blood_pressure",
            "heart_rate",
            "temperature",
            "weight",
            "oxygen_saturation",
            "respiratory_rate",
          ],
          description: "Type of vital sign to chart",
        },
        startDate: {
          type: "string",
          description: "Start date for the trend (YYYY-MM-DD)",
        },
        endDate: {
          type: "string",
          description: "End date for the trend (YYYY-MM-DD)",
        },
      },
      required: ["patientId", "vitalType"],
    },
  },
  {
    name: "getAllProviders",
    description: "Get a list of all healthcare providers",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "getProvider",
    description: "Get provider details by ID",
    inputSchema: {
      type: "object",
      properties: {
        providerId: {
          type: "string",
          description: "The provider's unique identifier",
        },
      },
      required: ["providerId"],
    },
  },
  {
    name: "resetDatabase",
    description: "Reset the EHR database to its original state",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];
