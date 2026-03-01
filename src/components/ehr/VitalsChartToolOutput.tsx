"use client";

import { useMemo } from "react";
import { VitalsChart } from "./VitalsChart";
import type { VitalReading } from "@/types/ehr";

interface VitalsTrendData {
  data: Array<{
    date: string;
    value: number;
    systolic?: number;
    diastolic?: number;
  }>;
  type: VitalReading["type"];
  unit: string;
  referenceRange?: { min?: number; max?: number };
}

interface VitalsChartToolOutputProps {
  toolName: string;
  result: string | undefined;
}

export function VitalsChartToolOutput({
  toolName,
  result,
}: VitalsChartToolOutputProps) {
  const chartData = useMemo(() => {
    if (toolName !== "getVitalsTrend" || !result) {
      return null;
    }

    try {
      const parsed = JSON.parse(result) as VitalsTrendData;
      if (!parsed.data || !Array.isArray(parsed.data) || !parsed.type) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [toolName, result]);

  if (!chartData) {
    return null;
  }

  return (
    <div className="mt-4">
      <VitalsChart
        data={chartData.data}
        vitalType={chartData.type}
        unit={chartData.unit}
        referenceRange={chartData.referenceRange}
      />
    </div>
  );
}
