"use client";

import { cn } from "@/lib/utils";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { FileText, FlaskConical, ClipboardList, AlertTriangle } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  className?: string;
}

const SUGGESTED_PROMPTS = [
  {
    id: "medications",
    title: "Summarize Medications",
    icon: FileText,
    prompt: "Please analyze the uploaded images and extract all medication information including drug names, dosages, and frequencies.",
  },
  {
    id: "labs",
    title: "Extract Lab Results",
    icon: FlaskConical,
    prompt: "Review the uploaded lab report and extract all test results. Highlight any values outside the normal range.",
  },
  {
    id: "summary",
    title: "Pre-Visit Summary",
    icon: ClipboardList,
    prompt: "Create a pre-visit summary for this patient based on the uploaded documents. Include current medications, recent lab results, and any concerns.",
  },
  {
    id: "interactions",
    title: "Drug Interactions",
    icon: AlertTriangle,
    prompt: "Based on the patient's current medications, identify any potential drug interactions or contraindications.",
  },
];

export function SuggestedPrompts({ onSelect, className }: SuggestedPromptsProps) {
  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <h2 className="text-lg font-semibold mb-4 text-center">
        How can I help you prepare for your patient visit?
      </h2>
      <Suggestions className="flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((item) => (
          <Suggestion
            key={item.id}
            suggestion={item.prompt}
            onClick={onSelect}
            className="h-auto py-2 px-4"
          >
            <item.icon className="size-4 mr-2" />
            {item.title}
          </Suggestion>
        ))}
      </Suggestions>
    </div>
  );
}
