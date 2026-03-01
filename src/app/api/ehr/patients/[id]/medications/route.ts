import { NextRequest, NextResponse } from "next/server";
import { ehrService } from "@/lib/ehr";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ehr/patients/[id]/medications - Get patient medications
export async function GET(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const includeHistory = searchParams.get("history") === "true";

  try {
    const medications = await ehrService.getPatientMedications(id, includeHistory);

    if (!medications) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: medications });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/ehr/patients/[id]/medications - Add medication
export async function POST(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;

  try {
    const body = await request.json();

    const medication = await ehrService.addMedication(id, {
      medicationName: body.medicationName,
      dosage: body.dosage,
      frequency: body.frequency,
      prescribedBy: body.prescribedBy,
      reason: body.reason,
      startDate: body.startDate,
      endDate: body.endDate,
      discontinuedReason: body.discontinuedReason,
    });

    if (!medication) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: medication }, { status: 201 });
  } catch (error) {
    console.error("Error adding medication:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
