import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export enum LLMProvider {
  GEMINI = "GEMINI",
  DEEPSEEK = "DEEPSEEK",
}

export interface LLMOptions {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface DeepseekOptions {
  siteUrl?: string;
  siteName?: string;
}

export interface PromptRequest {
  provider: LLMProvider;
  modelName: string;
  prompt: string;
  llmOptions?: LLMOptions;
  deepseekOptions?: DeepseekOptions;
}

// AIResponse might be general enough to be in a shared types/interfaces file later if used by other services
export interface AIResponse {
  content: string;
  summary: string;
}

async function runGeminiPrompt(
  modelName: string,
  prompt: string,
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

  const chat = model.startChat();
  return await chat.sendMessage(prompt);
}

async function runDeepseekPrompt(
  modelName: string,
  prompt: string,
  options: LLMOptions = {
    maxOutputTokens: 158000,
    temperature: 1,
    topP: 1.0,
    topK: 100,
  },
  deepseekOptions: DeepseekOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not defined");

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": deepseekOptions.siteUrl ?? "https://lexi.pharaon.me",
      "X-Title": deepseekOptions.siteName ?? "Lexi API",
    },
  });

  const completion = await client.chat.completions.create({
    model: modelName,
    messages: [{ role: "user", content: prompt }],
    max_tokens: options.maxOutputTokens ?? 128000,
    temperature: options.temperature ?? 1.0,
  });
  // console.log("Raw AI Response:", completion);

  return completion.choices[0]?.message?.content || "";
}

export async function runPrompt(
  request: PromptRequest
): Promise<GenerateContentResult | string> {
  const {
    provider,
    modelName,
    prompt,
    llmOptions = {},
    deepseekOptions = {},
  } = request;

  switch (provider) {
    case LLMProvider.GEMINI:
      // console.log("Running Gemini prompt...");
      return runGeminiPrompt(modelName, prompt, llmOptions);
    case LLMProvider.DEEPSEEK:
      // console.log("Running Deepseek prompt...");
      return runDeepseekPrompt(modelName, prompt, llmOptions, deepseekOptions);
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

function getContinuationPrompt(previousFragment: string): string {
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
  requestBody: PromptRequest, // Changed from any to PromptRequest
  // runPromptFn: (req: PromptRequest) => Promise<GenerateContentResult | string> // Explicitly typed for clarity
  runPromptFn: typeof runPrompt // Use typeof to refer to the runPrompt function in this module
): Promise<AIResponse> {
  // Return type changed to AIResponse
  const maxAttempts = 8;
  let partialResult = "";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentPrompt =
      attempt === 0 ? requestBody.prompt : getContinuationPrompt(partialResult);

    const rawResponse = getCleanAIText(
      await runPromptFn({ ...requestBody, prompt: currentPrompt })
    );
    // console.log(`Raw AI Response (attempt ${attempt + 1}):`, rawResponse);

    try {
      // If it's not the first attempt, we are trying to complete a partial JSON
      if (attempt > 0) {
        // Attempt to parse the accumulated partial result with the new fragment
        // This logic assumes the LLM tries to complete the JSON structure.
        // A more robust approach might involve specific instructions to the LLM
        // on how to append to a partial JSON, or more sophisticated JSON repair.
        const combinedJsonString = partialResult + rawResponse;
        // console.log(`Attempting to parse combined (attempt ${attempt + 1}): ${combinedJsonString}`);
        const json = JSON.parse(combinedJsonString);
        // console.log("Parsed JSON from combined:", json);
        if (json.content && json.summary) return json as AIResponse;
        // If parsing succeeded but didn't get both fields, we might still be incomplete
        partialResult = combinedJsonString; // Continue accumulating
      } else {
        // First attempt, try to parse the whole response
        const json = JSON.parse(rawResponse);
        // console.log("Parsed JSON (first attempt):", json);
        if (json.content && json.summary) return json as AIResponse;
        partialResult = rawResponse; // Start accumulating if not complete
      }
    } catch (_) {
      // If parsing fails, append the current raw response to partialResult and try again
      partialResult += (attempt === 0 ? "" : "") + rawResponse; // Avoid double-adding if first attempt also failed to parse but was assigned to partialResult
      // console.log(`Partial result after failed parse (attempt ${attempt + 1}): ${partialResult}`);
    }
  }

  // Last chance parse of whatever has been accumulated
  try {
    // console.log("Final merged partial result for parsing:", partialResult);
    const finalMerged = JSON.parse(partialResult);
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
