import { NextRequest, NextResponse } from "next/server";
import { ehrService } from "@/lib/ehr";
import type { VitalReading } from "@/types/ehr";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ehr/patients/[id]/vitals - Get patient vital signs
export async function GET(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const vitalType = searchParams.get("type") as VitalReading["type"] | null;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const trend = searchParams.get("trend") === "true";

  try {
    if (trend && vitalType) {
      // Return trend data for charting
      const trendData = await ehrService.getVitalsTrend(
        id,
        vitalType,
        startDate,
        endDate
      );

      if (!trendData) {
        return NextResponse.json(
          { success: false, error: "No vital data found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: trendData });
    }

    // Return raw vital readings
    const vitals = await ehrService.getVitals(
      id,
      vitalType || undefined,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: vitals,
      count: vitals.length,
    });
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/ehr/patients/[id]/vitals - Add vital reading
export async function POST(request: NextRequest, context: RouteParams) {
  const { id } = await context.params;

  try {
    const body = await request.json();

    const vital = await ehrService.addVitalReading(id, {
      date: body.date,
      type: body.type,
      value: body.value,
      systolic: body.systolic,
      diastolic: body.diastolic,
      numericValue: body.numericValue,
      unit: body.unit,
      source: body.source,
      notes: body.notes,
    });

    if (!vital) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vital }, { status: 201 });
  } catch (error) {
    console.error("Error adding vital:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
