import { NextRequest, NextResponse } from "next/server";
import { ehrService } from "@/lib/ehr";

// GET /api/ehr/patients - Get all patients or search
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  try {
    const patients = query
      ? await ehrService.searchPatients(query)
      : await ehrService.getAllPatients();

    return NextResponse.json({
      success: true,
      data: patients,
      count: patients.length,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
