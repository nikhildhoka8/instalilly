import type { MLCEngine, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import type { Attachment, PatientContext } from "@/types";

// System prompts for the medical assistant
const SYSTEM_PROMPT = `You are AgentMD, a medical assistant helping doctors prepare for patient visits.

Your role is to:
1. Analyze uploaded documents (prescriptions, lab reports, medical records)
2. Extract medication information, lab results, and clinical notes
3. Identify potential concerns or red flags
4. Generate concise pre-visit summaries

Guidelines:
- Be precise with medical terminology
- Highlight abnormal lab values
- Note potential drug interactions
- Use bullet points for clarity
- Focus on actionable information

When files are uploaded, acknowledge them and ask clarifying questions if needed.`;

export interface AgentInput {
  message: string;
  attachments: Attachment[];
  patientContext: PatientContext | null;
}

export interface AgentOutput {
  response: string;
  reasoning: string[];
}

export interface AgentStep {
  step: string;
  description: string;
}

type StepCallback = (step: AgentStep) => void;

export class MedicalAgent {
  private engine: MLCEngine;
  private conversationHistory: ChatCompletionMessageParam[] = [];

  constructor(engine: MLCEngine) {
    this.engine = engine;
    this.reset();
  }

  reset() {
    this.conversationHistory = [
      { role: "system", content: SYSTEM_PROMPT }
    ];
  }

  async process(
    input: AgentInput,
    onStep?: StepCallback
  ): Promise<AgentOutput> {
    const reasoning: string[] = [];

    // Step 1: Analyze input
    onStep?.({ step: "analyze", description: "Analyzing your request..." });
    reasoning.push("Analyzing input and attachments");

    // Build the user message
    let userMessage = input.message;

    // Add attachment context
    if (input.attachments.length > 0) {
      const attachmentList = input.attachments
        .map((a) => `- ${a.filename} (${a.type})`)
        .join("\n");
      userMessage += `\n\n[Attached files:\n${attachmentList}]`;
      reasoning.push(`Processing ${input.attachments.length} attachment(s)`);
    }

    // Add patient context if available
    if (input.patientContext?.patient) {
      const patient = input.patientContext.patient;
      const patientInfo = `
[Patient Context:
- Name: ${patient.name}
- DOB: ${patient.dateOfBirth}
- MRN: ${patient.mrn}
- Known Allergies: ${patient.allergies.join(", ") || "None"}
- Current Medications: ${patient.currentMedications.map((m) => `${m.name} ${m.dosage}`).join(", ") || "None"}
- Conditions: ${patient.conditions.join(", ") || "None"}]`;
      userMessage += patientInfo;
      reasoning.push("Included patient context in analysis");
    }

    // Step 2: Generate response
    onStep?.({ step: "generate", description: "Generating response..." });

    // Add the user message to history
    this.conversationHistory.push({ role: "user", content: userMessage });

    // Call the LLM
    const response = await this.engine.chat.completions.create({
      messages: this.conversationHistory,
      stream: false,
    });

    const assistantMessage = response.choices[0]?.message?.content || "";
    reasoning.push("Generated medical assistant response");

    // Add assistant response to history
    this.conversationHistory.push({ role: "assistant", content: assistantMessage });

    // Keep conversation history manageable (last 10 exchanges)
    if (this.conversationHistory.length > 21) { // system + 10 user/assistant pairs
      this.conversationHistory = [
        this.conversationHistory[0], // Keep system prompt
        ...this.conversationHistory.slice(-20), // Keep last 20 messages
      ];
    }

    return {
      response: assistantMessage,
      reasoning,
    };
  }

  // Stream the response for real-time display
  async *processStreaming(
    input: AgentInput,
    onStep?: StepCallback
  ): AsyncGenerator<{ token: string; isComplete: boolean }> {
    const reasoning: string[] = [];

    // Step 1: Analyze input
    onStep?.({ step: "analyze", description: "Analyzing your request..." });
    reasoning.push("Analyzing input and attachments");

    // Build the user message
    let userMessage = input.message;

    if (input.attachments.length > 0) {
      const attachmentList = input.attachments
        .map((a) => `- ${a.filename} (${a.type})`)
        .join("\n");
      userMessage += `\n\n[Attached files:\n${attachmentList}]`;
    }

    if (input.patientContext?.patient) {
      const patient = input.patientContext.patient;
      const patientInfo = `
[Patient Context:
- Name: ${patient.name}
- DOB: ${patient.dateOfBirth}
- MRN: ${patient.mrn}
- Known Allergies: ${patient.allergies.join(", ") || "None"}
- Current Medications: ${patient.currentMedications.map((m) => `${m.name} ${m.dosage}`).join(", ") || "None"}
- Conditions: ${patient.conditions.join(", ") || "None"}]`;
      userMessage += patientInfo;
    }

    // Step 2: Generate response
    onStep?.({ step: "generate", description: "Generating response..." });

    this.conversationHistory.push({ role: "user", content: userMessage });

    // Stream the response
    const stream = await this.engine.chat.completions.create({
      messages: this.conversationHistory,
      stream: true,
      stream_options: { include_usage: true },
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || "";
      if (token) {
        fullResponse += token;
        yield { token, isComplete: false };
      }
    }

    // Add to history
    this.conversationHistory.push({ role: "assistant", content: fullResponse });

    // Keep conversation history manageable
    if (this.conversationHistory.length > 21) {
      this.conversationHistory = [
        this.conversationHistory[0],
        ...this.conversationHistory.slice(-20),
      ];
    }

    yield { token: "", isComplete: true };
  }
}

// Factory function
export function createMedicalAgent(engine: MLCEngine): MedicalAgent {
  return new MedicalAgent(engine);
}
