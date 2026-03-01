"use client";

import { cn } from "@/lib/utils";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { FileText, Activity, PlusCircle } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  className?: string;
}

const SUGGESTED_PROMPTS = [
  {
    id: "medications",
    title: "View Medications",
    icon: FileText,
    prompt: "What medications is this patient on?",
  },
  {
    id: "blood-pressure",
    title: "Blood Pressure Chart",
    icon: Activity,
    prompt: "Can you show me this patients blood pressure over time?",
  },
  {
    id: "add-medication",
    title: "Add Medication from Image",
    icon: PlusCircle,
    prompt: "Based on my analysis, I want to recommend the medicine that I've added in the image to the user. Can you please add it to their list? It will be taken once every day. This will start on 02/28/2026",
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
