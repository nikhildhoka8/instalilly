"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { VitalReading } from "@/types/ehr";

interface VitalsChartProps {
  data: Array<{
    date: string;
    value: number;
    systolic?: number;
    diastolic?: number;
  }>;
  vitalType: VitalReading["type"];
  unit: string;
  referenceRange?: { min?: number; max?: number };
}

const vitalTypeLabels: Record<VitalReading["type"], string> = {
  blood_pressure: "Blood Pressure",
  heart_rate: "Heart Rate",
  temperature: "Temperature",
  weight: "Weight",
  oxygen_saturation: "Oxygen Saturation",
  respiratory_rate: "Respiratory Rate",
};

const vitalTypeColors: Record<VitalReading["type"], string> = {
  blood_pressure: "#ef4444",
  heart_rate: "#f97316",
  temperature: "#eab308",
  weight: "#22c55e",
  oxygen_saturation: "#3b82f6",
  respiratory_rate: "#8b5cf6",
};

export function VitalsChart({
  data,
  vitalType,
  unit,
  referenceRange,
}: VitalsChartProps) {
  const isBloodPressure = vitalType === "blood_pressure";
  const color = vitalTypeColors[vitalType];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">{vitalTypeLabels[vitalType]} Trend</h3>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelFormatter={(label) => {
              const dateStr = String(label);
              const date = new Date(dateStr);
              return date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
            }}
            formatter={(value, name) => {
              const nameStr = String(name);
              return [
                `${value} ${unit}`,
                nameStr === "systolic"
                  ? "Systolic"
                  : nameStr === "diastolic"
                  ? "Diastolic"
                  : vitalTypeLabels[vitalType],
              ];
            }}
          />

          {isBloodPressure ? (
            <>
              <Line
                type="monotone"
                dataKey="systolic"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2 }}
                name="systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                name="diastolic"
              />
              <Legend />
              {/* Reference line for systolic target */}
              <ReferenceLine
                y={120}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: "Target: 120", fill: "#22c55e", fontSize: 10 }}
              />
              <ReferenceLine
                y={80}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: "Target: 80", fill: "#22c55e", fontSize: 10 }}
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2 }}
              />
              {referenceRange?.min && (
                <ReferenceLine
                  y={referenceRange.min}
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  label={{
                    value: `Min: ${referenceRange.min}`,
                    fill: "#22c55e",
                    fontSize: 10,
                  }}
                />
              )}
              {referenceRange?.max && (
                <ReferenceLine
                  y={referenceRange.max}
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  label={{
                    value: `Max: ${referenceRange.max}`,
                    fill: "#22c55e",
                    fontSize: 10,
                  }}
                />
              )}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {isBloodPressure && data.length > 0 && (
        <div className="mt-3 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>Systolic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-blue-500" />
            <span>Diastolic</span>
          </div>
        </div>
      )}
    </div>
  );
}
