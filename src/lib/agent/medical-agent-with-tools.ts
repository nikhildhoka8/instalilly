import type { MLCEngine, WebWorkerMLCEngine, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import type { Attachment, PatientContext } from "@/types";

type ChatEngine = MLCEngine | WebWorkerMLCEngine;

// Tool definitions for the prompt (simpler version for the LLM)
// Note: These are kept for reference but the system prompt now has explicit tool documentation
const TOOL_DEFINITIONS = [
  {
    name: "searchPatients",
    description: "Search for patients by name, MRN (medical record number), or date of birth",
    parameters: "query: string - Search query",
  },
  {
    name: "getPatient",
    description: "Get detailed information about a specific patient by their ID",
    parameters: "patientId: string - The patient's unique identifier (e.g., 'pat-001')",
  },
  {
    name: "getPatientMedications",
    description: "READ ONLY - Get a patient's current medications and optionally their full medication history. Use this when user asks to VIEW/SHOW medications.",
    parameters: "patientId: string, includeHistory?: boolean",
  },
  {
    name: "addMedication",
    description: "WRITE - Add/prescribe a NEW medication to a patient's record. Use this when user asks to ADD/PRESCRIBE/START a medication.",
    parameters: "patientId: string, medicationName: string, dosage: string, frequency: string, prescribedBy: string, reason: string, startDate: string (YYYY-MM-DD format)",
  },
  {
    name: "discontinueMedication",
    description: "WRITE - Discontinue/stop a medication for a patient",
    parameters: "patientId: string, medicationId: string, reason: string",
  },
  {
    name: "getLabResults",
    description: "Get lab results for a patient, optionally filtered by date range",
    parameters: "patientId: string, startDate?: string, endDate?: string",
  },
  {
    name: "getVisitHistory",
    description: "Get visit history for a patient",
    parameters: "patientId: string, limit?: number",
  },
  {
    name: "getVitals",
    description: "Get vital signs history for a patient",
    parameters: "patientId: string, vitalType?: string, startDate?: string, endDate?: string",
  },
  {
    name: "getVitalsTrend",
    description: "Get vital signs data formatted for visualization/charting",
    parameters: "patientId: string, vitalType: string, startDate?: string, endDate?: string",
  },
  {
    name: "addVitalReading",
    description: "WRITE - Add a new vital reading for a patient",
    parameters: "patientId, date, type, value, unit, source, systolic?, diastolic?, numericValue?, notes?",
  },
];

// System prompt that includes tool calling instructions
const SYSTEM_PROMPT = `You are AgentMD, a medical assistant helping doctors with patient care and EHR data management.

You have access to the following EHR tools when a patient is connected:

## READ TOOLS (for retrieving data):
- searchPatients: Search for patients by name, MRN, or DOB
- getPatient: Get detailed patient information
- getPatientMedications: Get current medications and history (USE THIS TO VIEW MEDICATIONS)
- getLabResults: Get lab results
- getVisitHistory: Get visit history
- getVitals: Get vital signs history
- getVitalsTrend: Get vitals for charting

## WRITE TOOLS (for modifying data):
- addMedication: ADD a new medication to patient's record (USE THIS WHEN ASKED TO ADD/PRESCRIBE A MEDICATION)
- addVitalReading: Add a new vital reading

IMPORTANT - Tool Selection:
- When asked to "show", "view", "get", or "list" medications → use getPatientMedications
- When asked to "add", "prescribe", "start", or "put patient on" a medication → use addMedication
- For addMedication, you MUST provide: patientId, medicationName, dosage, frequency, prescribedBy, reason, startDate

When you need to use a tool, respond with a JSON block in this exact format:
\`\`\`tool_call
{
  "tool": "toolName",
  "args": { "param1": "value1", "param2": "value2" }
}
\`\`\`

Example - Adding Mounjaro:
\`\`\`tool_call
{
  "tool": "addMedication",
  "args": {
    "patientId": "pat-001",
    "medicationName": "Mounjaro (tirzepatide)",
    "dosage": "2.5mg",
    "frequency": "once weekly",
    "prescribedBy": "Dr. Smith",
    "reason": "Type 2 Diabetes / Weight Management",
    "startDate": "2026-02-28"
  }
}
\`\`\`

Guidelines:
1. Use tools when you have specific data needs or modification requests
2. When a patient is connected, use their ID (provided in context)
3. After requesting a tool, wait for the result before continuing
4. If no patient is connected, inform the user to connect to Epic EHR first
5. For write operations, gather required parameters from context or ask the user

When NOT using tools:
- Analyzing uploaded documents
- Explaining medical information
- Answering general medical questions
- Providing clinical decision support

Always be precise with medical terminology and highlight important findings.`;

export interface ToolCallRequest {
  tool: string;
  args: Record<string, unknown>;
}

export interface AgentInput {
  message: string;
  attachments: Attachment[];
  patientContext: PatientContext | null;
}

export interface AgentStep {
  step: string;
  description: string;
}

type StepCallback = (step: AgentStep) => void;

// Parse tool calls from the response - handles multiple formats
export function parseToolCalls(response: string): ToolCallRequest[] {
  const toolCalls: ToolCallRequest[] = [];

  const addToolCall = (parsed: { tool?: string; args?: Record<string, unknown> }) => {
    if (parsed.tool && parsed.args) {
      // Avoid duplicates
      const isDuplicate = toolCalls.some(
        (tc) =>
          tc.tool === parsed.tool &&
          JSON.stringify(tc.args) === JSON.stringify(parsed.args)
      );
      if (!isDuplicate) {
        toolCalls.push({ tool: parsed.tool, args: parsed.args });
      }
    }
  };

  // Format 1: ```tool_call { ... } ```
  const fencedRegex = /```tool_call\s*([\s\S]*?)```/g;
  let match;
  while ((match = fencedRegex.exec(response)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      addToolCall(parsed);
    } catch {
      // Invalid JSON, skip
    }
  }

  // Format 2: ```json { "tool": "...", "args": {...} } ``` - LLM sometimes uses json blocks
  const jsonFencedRegex = /```json\s*([\s\S]*?)```/g;
  while ((match = jsonFencedRegex.exec(response)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      // Only treat as tool call if it has the right structure
      if (parsed.tool && parsed.args) {
        addToolCall(parsed);
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // Format 3: tool_call{...} (inline without fence) - handles nested braces
  const inlinePattern = /tool_call\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/g;
  while ((match = inlinePattern.exec(response)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      addToolCall(parsed);
    } catch {
      // Invalid JSON, skip
    }
  }

  // Format 4: tool_call({"tool":"...", "args":{...}}) with parens
  const parenRegex = /tool_call\s*\(\s*(\{[\s\S]*?\})\s*\)/g;
  while ((match = parenRegex.exec(response)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      addToolCall(parsed);
    } catch {
      // Invalid JSON, skip
    }
  }

  // Format 5: json { "tool": ... } without code fences (malformed LLM output)
  // Also handles "json {" at the start
  const bareJsonPattern = /\bjson\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/gi;
  while ((match = bareJsonPattern.exec(response)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.tool && parsed.args) {
        addToolCall(parsed);
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // Format 6: Just look for any { "tool": ... } structure in the response
  const extracted = extractToolCallJson(response);
  if (extracted) {
    try {
      const parsed = JSON.parse(extracted.json);
      addToolCall(parsed);
    } catch {
      // Invalid JSON, skip
    }
  }

  return toolCalls;
}

// Check if a JSON block contains a tool call structure
function isToolCallJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    return parsed.tool && parsed.args;
  } catch {
    return false;
  }
}

// Try to extract tool call JSON from a potentially malformed string
function extractToolCallJson(content: string): { json: string; remaining: string } | null {
  // Look for { "tool": pattern
  const toolMatch = content.match(/\{\s*"tool"\s*:/);
  if (!toolMatch) return null;

  const startIdx = toolMatch.index!;
  let braceCount = 0;
  let endIdx = -1;

  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === "{") braceCount++;
    if (content[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }

  if (endIdx === -1) return null;

  const json = content.substring(startIdx, endIdx);
  const remaining = content.substring(endIdx);

  if (isToolCallJson(json)) {
    return { json, remaining };
  }

  return null;
}

// Remove tool call blocks from response for display
export function removeToolCallBlocks(response: string): string {
  let result = response;

  // Remove fenced tool_call blocks
  result = result.replace(/```tool_call\s*[\s\S]*?```/g, "");

  // Remove json blocks that contain tool calls (properly closed)
  result = result.replace(/```json\s*([\s\S]*?)```/g, (match, jsonContent) => {
    if (isToolCallJson(jsonContent.trim())) {
      return ""; // Remove if it's a tool call
    }
    return match; // Keep if it's regular JSON
  });

  // Handle malformed json blocks (missing closing ```) that contain tool calls
  // Pattern: ```json followed by tool call JSON followed by text (no closing ```)
  result = result.replace(/```json\s*\n?([\s\S]*)/g, (match, content) => {
    // Check if there's a closing ``` - if so, it was already handled above
    if (content.includes("```")) {
      return match;
    }

    // Try to extract and remove just the tool call JSON
    const extracted = extractToolCallJson(content);
    if (extracted) {
      // Clean up any stray characters after the JSON (like ] or })
      let remaining = extracted.remaining;
      // Remove leading punctuation that might have been part of malformed output
      remaining = remaining.replace(/^[\]\}\)\s]+/, "");
      return remaining.trim();
    }

    return match;
  });

  // Remove bare "json { ... }" patterns (without code fences) that contain tool calls
  result = result.replace(/\bjson\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/gi, (match, jsonContent) => {
    if (isToolCallJson(jsonContent.trim())) {
      return ""; // Remove if it's a tool call
    }
    return match;
  });

  // Remove inline tool calls - match tool_call followed by balanced JSON
  const inlineToolCallPattern = /tool_call\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g;
  result = result.replace(inlineToolCallPattern, "");

  // Remove tool calls with parens
  result = result.replace(/tool_call\s*\(\s*\{[\s\S]*?\}\s*\)/g, "");

  // Remove any bare { "tool": ... } patterns that are tool calls
  result = result.replace(/(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/g, (match) => {
    if (isToolCallJson(match.trim())) {
      return "";
    }
    return match;
  });

  // Remove any remaining ```json or ``` artifacts
  result = result.replace(/```json\s*$/g, "");
  result = result.replace(/^```\s*/gm, "");

  // Clean up extra whitespace
  result = result.replace(/\n{3,}/g, "\n\n").trim();

  return result;
}

// Execute a tool call via the API
export async function executeToolCall(
  toolCall: ToolCallRequest
): Promise<string> {
  try {
    const response = await fetch("/api/ehr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "tools/call",
        params: {
          name: toolCall.tool,
          arguments: toolCall.args,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Tool call failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.error) {
      return `Error: ${result.error.message}`;
    }

    // Extract the text content from MCP response
    if (result.content && result.content[0]?.text) {
      return result.content[0].text;
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    return `Error executing tool: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

export class MedicalAgentWithTools {
  private engine: ChatEngine;
  private conversationHistory: ChatCompletionMessageParam[] = [];

  constructor(engine: ChatEngine) {
    this.engine = engine;
    this.reset();
  }

  reset() {
    this.conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];
  }

  // Build the user message with context
  private buildUserMessage(input: AgentInput): string {
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
[Connected Patient:
- Patient ID: ${patient.id}
- Name: ${patient.name}
- DOB: ${patient.dateOfBirth}
- MRN: ${patient.mrn}
- Known Allergies: ${patient.allergies.join(", ") || "None"}
- Current Medications: ${patient.currentMedications.map((m) => `${m.name} ${m.dosage}`).join(", ") || "None"}
- Conditions: ${patient.conditions.join(", ") || "None"}]

You can use tools to query more detailed information about this patient using their ID: ${patient.id}`;
      userMessage += patientInfo;
    } else {
      userMessage +=
        "\n\n[No patient connected. User needs to connect to Epic EHR to access patient data.]";
    }

    return userMessage;
  }

  // Add tool result to conversation
  addToolResult(toolName: string, result: string) {
    this.conversationHistory.push({
      role: "user",
      content: `[Tool Result for ${toolName}]:\n${result}\n\nPlease continue with your response based on this data.`,
    });
  }

  // Stream the response
  async *processStreaming(
    input: AgentInput,
    onStep?: StepCallback
  ): AsyncGenerator<{
    token: string;
    isComplete: boolean;
    toolCalls?: ToolCallRequest[];
  }> {
    onStep?.({ step: "analyze", description: "Analyzing your request..." });

    const userMessage = this.buildUserMessage(input);
    this.conversationHistory.push({ role: "user", content: userMessage });

    onStep?.({ step: "generate", description: "Generating response..." });

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

    // Check for tool calls
    const toolCalls = parseToolCalls(fullResponse);

    if (toolCalls.length > 0) {
      onStep?.({
        step: "tool_request",
        description: `Requesting tool: ${toolCalls.map((t) => t.tool).join(", ")}`,
      });
    }

    // Keep conversation history manageable
    if (this.conversationHistory.length > 21) {
      this.conversationHistory = [
        this.conversationHistory[0],
        ...this.conversationHistory.slice(-20),
      ];
    }

    yield { token: "", isComplete: true, toolCalls };
  }

  // Continue after tool execution
  async *continueAfterTools(
    onStep?: StepCallback
  ): AsyncGenerator<{ token: string; isComplete: boolean }> {
    onStep?.({
      step: "continue",
      description: "Processing tool results...",
    });

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

    this.conversationHistory.push({ role: "assistant", content: fullResponse });

    if (this.conversationHistory.length > 21) {
      this.conversationHistory = [
        this.conversationHistory[0],
        ...this.conversationHistory.slice(-20),
      ];
    }

    yield { token: "", isComplete: true };
  }
}

export function createMedicalAgentWithTools(
  engine: ChatEngine
): MedicalAgentWithTools {
  return new MedicalAgentWithTools(engine);
}
