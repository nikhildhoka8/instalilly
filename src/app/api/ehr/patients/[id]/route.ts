import { NextRequest, NextResponse } from "next/server";
import { ehrService } from "@/lib/ehr";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ehr/patients/[id] - Get patient by ID
export async function GET(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;

  try {
    const patient = await ehrService.getPatient(id);

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: patient });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
