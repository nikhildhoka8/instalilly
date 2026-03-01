import { NextRequest, NextResponse } from "next/server";
import { ehrService } from "@/lib/ehr";
import { ehrTools } from "@/lib/ehr";
import type { MCPToolCallRequest } from "@/types/ehr";

// GET /api/ehr - Returns available MCP tools
export async function GET() {
  return NextResponse.json({
    name: "epic-ehr-connector",
    version: "1.0.0",
    description: "MCP server for Epic EHR integration (mock)",
    tools: ehrTools,
  });
}

// POST /api/ehr - Execute MCP tool call
export async function POST(request: NextRequest) {
  try {
    const body: MCPToolCallRequest = await request.json();
    const { name, arguments: args } = body.params;

    let result: unknown;

    switch (name) {
      case "searchPatients":
        result = await ehrService.searchPatients(args.query as string);
        break;

      case "getPatient":
        result = await ehrService.getPatient(args.patientId as string);
        break;

      case "getPatientMedications":
        result = await ehrService.getPatientMedications(
          args.patientId as string,
          args.includeHistory as boolean
        );
        break;

      case "addMedication":
        result = await ehrService.addMedication(args.patientId as string, {
          medicationName: args.medicationName as string,
          dosage: args.dosage as string,
          frequency: args.frequency as string,
          prescribedBy: args.prescribedBy as string,
          reason: args.reason as string,
          startDate: args.startDate as string,
          endDate: args.endDate as string | undefined,
          discontinuedReason: args.discontinuedReason as string | undefined,
        });
        break;

      case "discontinueMedication":
        result = await ehrService.discontinueMedication(
          args.patientId as string,
          args.medicationId as string,
          args.reason as string
        );
        break;

      case "getLabResults":
        result = await ehrService.getLabResults(
          args.patientId as string,
          args.startDate as string | undefined,
          args.endDate as string | undefined
        );
        break;

      case "addLabReport":
        result = await ehrService.addLabReport(args.patientId as string, {
          orderId: args.orderId as string,
          orderDate: args.orderDate as string,
          collectionDate: args.collectionDate as string,
          reportDate: args.reportDate as string,
          orderingProvider: args.orderingProvider as string,
          labName: args.labName as string,
          status: args.status as "pending" | "completed" | "cancelled",
          results: args.results as {
            name: string;
            value: string;
            unit: string;
            referenceRange: string;
            status: "normal" | "high" | "low" | "critical";
          }[],
        });
        break;

      case "getVisitHistory":
        result = await ehrService.getVisitHistory(
          args.patientId as string,
          args.limit as number | undefined
        );
        break;

      case "addVisit":
        result = await ehrService.addVisit(args.patientId as string, {
          date: args.date as string,
          type: args.type as "office" | "telehealth" | "emergency" | "followup",
          chiefComplaint: args.chiefComplaint as string,
          diagnosis: args.diagnosis as string[] | undefined,
          notes: args.notes as string | undefined,
          providerId: args.providerId as string,
        });
        break;

      case "getVitals":
        result = await ehrService.getVitals(
          args.patientId as string,
          args.vitalType as
            | "blood_pressure"
            | "heart_rate"
            | "temperature"
            | "weight"
            | "oxygen_saturation"
            | "respiratory_rate"
            | undefined,
          args.startDate as string | undefined,
          args.endDate as string | undefined
        );
        break;

      case "addVitalReading":
        result = await ehrService.addVitalReading(args.patientId as string, {
          date: args.date as string,
          type: args.type as
            | "blood_pressure"
            | "heart_rate"
            | "temperature"
            | "weight"
            | "oxygen_saturation"
            | "respiratory_rate",
          value: args.value as string,
          systolic: args.systolic as number | undefined,
          diastolic: args.diastolic as number | undefined,
          numericValue: args.numericValue as number | undefined,
          unit: args.unit as string,
          source: args.source as "clinic" | "home" | "hospital" | "device",
          notes: args.notes as string | undefined,
        });
        break;

      case "getVitalsTrend":
        result = await ehrService.getVitalsTrend(
          args.patientId as string,
          args.vitalType as
            | "blood_pressure"
            | "heart_rate"
            | "temperature"
            | "weight"
            | "oxygen_saturation"
            | "respiratory_rate",
          args.startDate as string | undefined,
          args.endDate as string | undefined
        );
        break;

      case "getAllProviders":
        result = await ehrService.getAllProviders();
        break;

      case "getProvider":
        result = await ehrService.getProvider(args.providerId as string);
        break;

      case "resetDatabase":
        await ehrService.resetDatabase();
        result = { success: true, message: "Database reset to original state" };
        break;

      default:
        return NextResponse.json(
          {
            error: {
              code: "UNKNOWN_TOOL",
              message: `Unknown tool: ${name}`,
            },
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    });
  } catch (error) {
    console.error("MCP tool call error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
