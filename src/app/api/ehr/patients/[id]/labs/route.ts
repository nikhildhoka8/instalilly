import { NextRequest, NextResponse } from "next/server";
import { ehrService } from "@/lib/ehr";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ehr/patients/[id]/labs - Get patient lab reports
export async function GET(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  try {
    const labs = await ehrService.getLabResults(id, startDate, endDate);

    return NextResponse.json({
      success: true,
      data: labs,
      count: labs.length,
    });
  } catch (error) {
    console.error("Error fetching labs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/ehr/patients/[id]/labs - Add lab report
export async function POST(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;

  try {
    const body = await request.json();

    const lab = await ehrService.addLabReport(id, {
      orderId: body.orderId,
      orderDate: body.orderDate,
      collectionDate: body.collectionDate,
      reportDate: body.reportDate,
      orderingProvider: body.orderingProvider,
      labName: body.labName,
      status: body.status,
      results: body.results,
    });

    if (!lab) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lab }, { status: 201 });
  } catch (error) {
    console.error("Error adding lab report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
