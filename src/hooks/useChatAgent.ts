"use client";

import { useCallback, useState } from "react";
import { useWebLLM } from "./useWebLLM";
import type { Attachment, PatientContext, ReasoningStep } from "@/types";

// Mock responses for demo
const MOCK_RESPONSES = [
  `## Pre-Visit Summary

Based on my analysis, here's what I found:

### Medications Identified
- **Metformin 500mg** - Twice daily for Type 2 Diabetes
- **Lisinopril 10mg** - Once daily for Hypertension
- **Atorvastatin 20mg** - Once daily for Cholesterol Management

### Key Observations
- Patient appears to be managing multiple chronic conditions
- Medication adherence should be verified during visit
- No apparent drug interactions detected

### Recommendations
1. Review HbA1c levels from recent labs
2. Check blood pressure during visit
3. Discuss any side effects from current medications

*Note: This is a demo response. In production, the AI would analyze your actual uploaded documents.*`,

  `## Lab Results Analysis

### Complete Blood Count (CBC)
| Test | Result | Reference Range | Status |
|------|--------|-----------------|--------|
| WBC | 7.2 | 4.5-11.0 K/uL | Normal |
| RBC | 4.8 | 4.5-5.5 M/uL | Normal |
| Hemoglobin | 14.2 | 13.5-17.5 g/dL | Normal |
| Hematocrit | 42% | 38-50% | Normal |

### Metabolic Panel
| Test | Result | Reference Range | Status |
|------|--------|-----------------|--------|
| Glucose | 126 | 70-100 mg/dL | ⚠️ Elevated |
| BUN | 18 | 7-20 mg/dL | Normal |
| Creatinine | 1.1 | 0.7-1.3 mg/dL | Normal |

### Notes
- Fasting glucose is slightly elevated, consistent with pre-diabetic or diabetic condition
- Kidney function appears normal
- All other values within normal limits

*Note: This is a demo response.*`,

  `## Drug Interaction Check

I've analyzed the current medication list for potential interactions:

### Current Medications
1. Metformin 500mg BID
2. Lisinopril 10mg QD
3. Aspirin 81mg QD

### Interaction Analysis

✅ **Metformin + Lisinopril**: No significant interaction. Safe to use together.

✅ **Metformin + Aspirin**: No significant interaction. Low-dose aspirin is commonly used alongside metformin.

✅ **Lisinopril + Aspirin**: Minor interaction - NSAIDs can reduce the effectiveness of ACE inhibitors. However, low-dose aspirin (81mg) typically does not cause significant issues.

### Recommendations
- Current medication regimen appears safe
- Monitor blood pressure regularly
- Watch for signs of GI bleeding with long-term aspirin use

*Note: This is a demo response.*`,
];

export function useChatAgent() {
  const { isReady } = useWebLLM();
  const [isProcessing, setIsProcessing] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [responseIndex, setResponseIndex] = useState(0);

  const processInput = useCallback(
    async (
      message: string,
      attachments: Attachment[] = [],
      _patientContext: PatientContext | null = null
    ): Promise<{
      response: string;
      reasoning: string[];
    }> => {
      setIsProcessing(true);
      setReasoningSteps([]);
      setCurrentStep("");

      const reasoning: string[] = [];

      // Simulate processing steps
      const steps = [
        { step: "analyze", description: "Analyzing your request..." },
        { step: "process", description: "Processing uploaded documents..." },
        { step: "extract", description: "Extracting medical information..." },
        { step: "generate", description: "Generating summary..." },
      ];

      for (const step of steps) {
        setCurrentStep(step.step);
        setReasoningSteps((prev) => [
          ...prev,
          {
            id: `${step.step}-${Date.now()}`,
            step: step.step,
            description: step.description,
            status: "completed",
          },
        ]);
        reasoning.push(step.description);
        await new Promise((r) => setTimeout(r, 500));
      }

      // Get mock response (cycle through available responses)
      const response = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length];
      setResponseIndex((prev) => prev + 1);

      setIsProcessing(false);
      setCurrentStep("");

      return { response, reasoning };
    },
    [responseIndex]
  );

  const resetConversation = useCallback(() => {
    setReasoningSteps([]);
    setCurrentStep("");
    setResponseIndex(0);
  }, []);

  return {
    isReady,
    isProcessing,
    reasoningSteps,
    currentStep,
    processInput,
    resetConversation,
  };
}
