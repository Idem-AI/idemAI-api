import {
  GoogleGenerativeAI,
  GenerateContentResult,
  Content, // Import Content type for Gemini
} from "@google/generative-ai";
import OpenAI from "openai";
import dotenv from "dotenv";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

dotenv.config();

export enum LLMProvider {
  GEMINI = "GEMINI",
}

export interface LLMOptions {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

// Define a common ChatMessage structure
export interface ChatMessage {
  role: "user" | "assistant" | "system"; // Added system role
  content: string;
}

export interface PromptRequest {
  provider: LLMProvider;
  modelName: string;
  messages: ChatMessage[]; // Changed from prompt: string
  llmOptions?: LLMOptions;
  contextFilePaths?: string[];
}

export interface AIResponse {
  content: string;
  summary: string;
}

// Helper to convert our ChatMessage to Gemini's Content format
function toGeminiMessages(messages: ChatMessage[]): Content[] {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : msg.role, // Map 'assistant' to 'model'
    parts: [{ text: msg.content }],
  }));
}

async function runGeminiPrompt(
  modelName: string,
  messages: ChatMessage[], // Changed from prompt: string
  options: LLMOptions = {
    maxOutputTokens: 990000,
    temperature: 0.9,
    topP: 1,
    topK: 100,
  }
): Promise<GenerateContentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 99000,
      temperature: options.temperature ?? 0.9,
      topP: options.topP ?? 0.9,
      topK: options.topK ?? 100,
    },
  });

  const geminiMessages = toGeminiMessages(messages);
  const history = geminiMessages.slice(0, -1);
  const latestMessage = geminiMessages.slice(-1)[0];

  if (!latestMessage || latestMessage.role !== "user") {
    throw new Error("Last message to Gemini must be from user role.");
  }

  const chat = model.startChat({ history });
  return await chat.sendMessage(
    latestMessage.parts.map((p) => p.text).join("\n")
  ); // sendMessage expects string or Part[]
}



export async function runPrompt(
  request: PromptRequest
): Promise<GenerateContentResult | string> {
  const {
    provider,
    modelName,
    messages, // Changed from prompt
    llmOptions = {},
  } = request;

  if (!messages || messages.length === 0) {
    throw new Error("Messages array cannot be empty.");
  }

  switch (provider) {
    case LLMProvider.GEMINI:
      return runGeminiPrompt(modelName, messages, llmOptions);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

export function getCleanAIText(response: any): string {
  const raw =
    typeof response === "string"
      ? response
      : response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return raw
    .replace(/^```(json)?\s*/i, "")
    .replace(/```$/g, "")
    .trim();
}

// This function might be less relevant or need adjustment with chat history.
// For now, keeping it for fallback if file creation fails.
function getContinuationPromptForFile(previousFragment: string): string {
  return `
this content is not complete and is not a valid JSON, please continue the JSON from the last line:
finally i want json formated like this:
{
  "content": "string",
  "summary": "string"
}
of course it is sum of all the previous content and the new content not repeating the previous content and not need to create for exemple the content and summary again, just continue the JSON from the last line:
this is the last line: 
just continue not repeating the previous content:
${previousFragment.trim()}
`.trim();
}

export async function tryGenerateFullJSON(
  requestBody: PromptRequest,
  runPromptFn: typeof runPrompt
): Promise<AIResponse> {
  const maxAttempts = 8;
  let lastAIResponseContent = ""; // Stores the raw content of the last AI response
  let currentMessages: ChatMessage[] = [...requestBody.messages]; // Initialize with original messages

  if (
    !currentMessages.length ||
    currentMessages[currentMessages.length - 1].role !== "user"
  ) {
    throw new Error(
      "Initial PromptRequest for tryGenerateFullJSON must contain at least one user message."
    );
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let tempFilePath: string | undefined;
    const currentRequestBody: PromptRequest = {
      ...requestBody, // provider, modelName, llmOptions
      messages: [...currentMessages], // Use the evolving message history
    };

    if (attempt > 0) {
      // Add AI's last (incomplete) response to history
      currentRequestBody.messages.push({
        role: "assistant",
        content: lastAIResponseContent,
      });

      // Create temp file with the last AI response
      try {
        const tempDir = os.tmpdir();
        tempFilePath = path.join(
          tempDir,
          `llm_context_${Date.now()}_${attempt}.txt`
        );
        await fs.writeFile(tempFilePath, lastAIResponseContent);
        currentRequestBody.contextFilePaths = [tempFilePath]; // Set context file for the next user message

        // Add new user message instructing AI to correct based on file/history
        currentRequestBody.messages.push({
          role: "user",
          content: `Your previous attempt to generate the JSON (also provided in the attached file at ${tempFilePath}) was incomplete or invalid. Please review our conversation history and the content of the attached file. Your task is to generate a *complete and valid* JSON object with 'content' (string) and 'summary' (string) fields. Ensure your output is only the final, corrected, and complete JSON structure. Do not repeat instructions.`,
        });
      } catch (fileError) {
        console.error(
          `Error creating temp file for AI context (attempt ${attempt + 1}):`,
          fileError
        );
        // Fallback: Add a simpler continuation user message if file ops fail
        currentRequestBody.messages.push({
          role: "user",
          content: getContinuationPromptForFile(lastAIResponseContent), // Fallback prompt
        });
        currentRequestBody.contextFilePaths = undefined;
      }
    }

    let rawResponseFromAI = "";
    try {
      // The runPromptFn now takes the potentially augmented message history
      rawResponseFromAI = getCleanAIText(await runPromptFn(currentRequestBody));
    } catch (runError) {
      console.error(
        `Error running prompt function (attempt ${attempt + 1}):`,
        runError
      );
      if (tempFilePath) {
        await fs
          .unlink(tempFilePath)
          .catch((err) =>
            console.warn(
              `Failed to delete temp file ${tempFilePath} after runError:`,
              err
            )
          );
      }
      if (attempt === maxAttempts - 1) {
        const errorMessage =
          runError instanceof Error ? runError.message : String(runError);
        throw new Error(`AI call failed on the last attempt: ${errorMessage}`);
      }
      // Don't update lastAIResponseContent if call failed, retry with existing history + new user prompt
      currentMessages = [...currentRequestBody.messages]; // Persist the messages used for this failed attempt for the next one
      continue;
    }

    if (tempFilePath) {
      await fs
        .unlink(tempFilePath)
        .catch((err) =>
          console.warn(`Failed to delete temp file ${tempFilePath}:`, err)
        );
    }

    lastAIResponseContent = rawResponseFromAI; // Store this attempt's AI response

    try {
      const json = JSON.parse(rawResponseFromAI);
      if (json.content && json.summary) {
        return json as AIResponse;
      }
      // Parsed, but not the full structure. lastAIResponseContent is already set for next iteration.
    } catch (_) {
      // Parsing failed. lastAIResponseContent is already set for next iteration.
    }

    // Prepare currentMessages for the next iteration (if any)
    // It should be the history *before* this attempt's AI response and user retry prompt
    // So, if this attempt failed to produce valid JSON, the next attempt will append this attempt's AI response
    // and a new user retry message.
    if (attempt < maxAttempts - 1) {
      // If not the last attempt
      // The currentRequestBody.messages for this iteration already contains the history *up to the user's retry prompt*.
      // We need to ensure 'currentMessages' for the *next* loop iteration starts correctly.
      // It should be the original user messages + any successful AI responses + this attempt's user retry prompt.
      // Actually, simpler: currentMessages for the next loop will be built by adding the current lastAIResponseContent (as assistant)
      // and a new user message. So, we just need to ensure currentMessages reflects the history *up to* the point before the AI's *current* response.
      // The current currentRequestBody.messages is what was sent. We need to add its response for the next turn.
      currentMessages = [
        ...currentRequestBody.messages,
        { role: "assistant", content: lastAIResponseContent },
      ];
      // The next loop iteration will then add its *new* user message.
      // This logic is a bit complex. Let's simplify:
      // The `currentMessages` at the start of the loop is the history *before* the current attempt's user message (if attempt > 0).
      // The `currentRequestBody.messages` is built *inside* the loop for the current call.
      // If the call is done and parsing fails, `lastAIResponseContent` is updated.
      // For the next loop, `currentMessages` should be the history that *led to* `lastAIResponseContent`.
      // So, `currentMessages` should be what was just sent to the AI in `currentRequestBody.messages`.
      currentMessages = [...currentRequestBody.messages];
    }
  }

  try {
    const finalMerged = JSON.parse(lastAIResponseContent);
    if (finalMerged.content && finalMerged.summary)
      return finalMerged as AIResponse;
    throw new Error("Final parsed JSON does not contain content and summary.");
  } catch (err) {
    console.error("Final parsing failed after all attempts:", err);
    throw new Error(
      "Could not generate a valid JSON with content and summary after multiple attempts."
    );
  }
}
