import { StateGraph, END } from "@langchain/langgraph";
import { MedicalAgentState, type MedicalAgentStateType } from "./state";
import type { MLCEngine, ChatCompletionMessageParam } from "@mlc-ai/web-llm";

// System prompts for different agent nodes
const SYSTEM_PROMPTS = {
  analyzeInput: `You are a medical AI assistant helping doctors prepare for patient visits.
Analyze the user's request and any attached files to understand what information they need.
Be concise and focus on extracting actionable medical information.`,

  extractMedical: `You are a medical data extraction specialist.
Extract the following from the provided content:
- Medication names, dosages, and frequencies
- Lab results with values and reference ranges
- Important clinical notes or observations

Format your response as structured data. Be precise with medical terminology.`,

  generateSummary: `You are a medical summary specialist.
Create a concise pre-visit summary for the doctor including:
- Patient's current medications
- Recent lab results
- Key clinical observations
- Any red flags or concerns

Keep the summary brief but comprehensive. Use bullet points for clarity.`,
};

type ChatFunction = (
  messages: ChatCompletionMessageParam[]
) => Promise<string>;

export function createMedicalAgent(engine: MLCEngine) {
  // Helper function to call the LLM
  const callLLM: ChatFunction = async (messages) => {
    const response = await engine.chat.completions.create({
      messages,
      stream: false,
    });
    return response.choices[0]?.message?.content || "";
  };

  // Define the graph
  const graph = new StateGraph(MedicalAgentState)
    // Node: Analyze input and determine processing path
    .addNode("analyzeInput", async (state: MedicalAgentStateType) => {
      const hasAttachments = state.attachments.length > 0;

      let analysisPrompt = `User request: ${state.userMessage}`;

      if (hasAttachments) {
        const attachmentInfo = state.attachments
          .map((a) => `- ${a.filename} (${a.type})`)
          .join("\n");
        analysisPrompt += `\n\nAttached files:\n${attachmentInfo}`;
      }

      const response = await callLLM([
        { role: "system", content: SYSTEM_PROMPTS.analyzeInput },
        { role: "user", content: analysisPrompt },
      ]);

      return {
        currentStep: "analyzeInput",
        reasoning: [`Analyzed user request: ${state.userMessage.slice(0, 50)}...`],
        response,
      };
    })

    // Node: Process and extract medical information
    .addNode("extractMedical", async (state: MedicalAgentStateType) => {
      let extractionPrompt = `Based on the analysis, extract medical information.\n\nContext: ${state.response}`;

      if (state.patientContext?.patient) {
        const patient = state.patientContext.patient;
        extractionPrompt += `\n\nPatient: ${patient.name}\nKnown medications: ${patient.currentMedications.map((m) => m.name).join(", ")}`;
      }

      const response = await callLLM([
        { role: "system", content: SYSTEM_PROMPTS.extractMedical },
        { role: "user", content: extractionPrompt },
      ]);

      // Parse the response to extract structured data
      // In a real implementation, this would be more sophisticated
      const extractedNotes = response
        .split("\n")
        .filter((line) => line.trim().length > 0);

      return {
        currentStep: "extractMedical",
        reasoning: ["Extracted medical information from provided content"],
        extractedNotes,
        response,
      };
    })

    // Node: Generate summary for EHR
    .addNode("generateSummary", async (state: MedicalAgentStateType) => {
      const summaryPrompt = `Generate a pre-visit summary based on:

Extracted information:
${state.extractedNotes.join("\n")}

${state.patientContext?.patient ? `Patient: ${state.patientContext.patient.name}` : ""}

Create a clear, actionable summary for the doctor.`;

      const response = await callLLM([
        { role: "system", content: SYSTEM_PROMPTS.generateSummary },
        { role: "user", content: summaryPrompt },
      ]);

      // Create EHR summary
      const ehrSummary = state.patientContext?.patient
        ? {
            patientId: state.patientContext.patient.id,
            summaryDate: new Date().toISOString(),
            medications: state.extractedMedications,
            labResults: state.extractedLabResults,
            notes: state.extractedNotes,
            recommendations: [],
          }
        : null;

      return {
        currentStep: "generateSummary",
        reasoning: ["Generated pre-visit summary"],
        response,
        ehrSummary,
      };
    })

    // Define edges
    .addEdge("__start__", "analyzeInput")
    .addEdge("analyzeInput", "extractMedical")
    .addEdge("extractMedical", "generateSummary")
    .addEdge("generateSummary", END);

  return graph.compile();
}

export type MedicalAgentGraph = ReturnType<typeof createMedicalAgent>;
