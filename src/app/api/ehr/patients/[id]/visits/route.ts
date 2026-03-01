import { NextRequest, NextResponse } from "next/server";
import { ehrService } from "@/lib/ehr";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ehr/patients/[id]/visits - Get patient visit history
export async function GET(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  try {
    const visits = await ehrService.getVisitHistory(id, limit);

    return NextResponse.json({
      success: true,
      data: visits,
      count: visits.length,
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/ehr/patients/[id]/visits - Add visit
export async function POST(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;

  try {
    const body = await request.json();

    const visit = await ehrService.addVisit(id, {
      date: body.date,
      type: body.type,
      chiefComplaint: body.chiefComplaint,
      diagnosis: body.diagnosis,
      notes: body.notes,
      providerId: body.providerId,
    });

    if (!visit) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: visit }, { status: 201 });
  } catch (error) {
    console.error("Error adding visit:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
