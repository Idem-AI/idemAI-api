import {
  GoogleGenAI,
  createPartFromUri,
  Content,
  Part,
  GenerateContentResponse,
  File,
} from "@google/genai";
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

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PromptRequest {
  provider: LLMProvider;
  modelName: string;
  messages: ChatMessage[];
  llmOptions?: LLMOptions;
  contextFilePaths?: string[];
  file?: {
    localPath: string;
    mimeType?: string;
  };
}

export interface AIResponse {
  content: string;
  summary: string;
}

export class PromptService {
  private genAIClient: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    this.genAIClient = new GoogleGenAI({ apiKey });
  }

  private toGeminiMessages(messages: ChatMessage[]): Content[] {
    return messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));
  }

  private async _runGeminiPrompt(
    modelName: string,
    messages: ChatMessage[],
    llmOptions: LLMOptions,
    fileInput?: { localPath: string; mimeType?: string }
  ): Promise<GenerateContentResponse> {
    const geminiContent: Content[] = this.toGeminiMessages(messages);

    if (fileInput && fileInput.localPath) {
      if (geminiContent.length === 0) {
        geminiContent.push({ role: "user", parts: [] });
      }

      try {
        console.log(
          `Uploading file: ${fileInput.localPath}, MimeType (intended, if SDK infers): ${fileInput.mimeType}`
        );
        // Simplifying files.upload call to match user's example: only 'file' path.
        // The SDK should infer mimeType, or it might be available on the response.
        const uploadedFile: File = await this.genAIClient.files.upload({
          file: fileInput.localPath,
        });

        // We need mimeType for createPartFromUri. Check if it's on the response.
        // If fileInput.mimeType was provided by the user, and SDK doesn't allow setting it during upload,
        // we might prefer the user-provided one if available and SDK's is generic.
        // For now, let's prioritize SDK's detected mimeType if present on uploadedFile.
        const effectiveMimeType = uploadedFile.mimeType || fileInput.mimeType;

        if (!uploadedFile || !uploadedFile.uri || !effectiveMimeType) {
          throw new Error(
            "File upload response did not contain expected file details (uri or an effective mimeType)."
          );
        }
        console.log(
          `File uploaded successfully: URI ${uploadedFile.uri}, MimeType (from SDK): ${uploadedFile.mimeType}`
        );

        const filePart = createPartFromUri(uploadedFile.uri, effectiveMimeType);

        const lastMessageTurn = geminiContent[geminiContent.length - 1];
        if (!lastMessageTurn.parts) {
          lastMessageTurn.parts = [];
        }
        lastMessageTurn.parts.push(filePart);
      } catch (uploadError) {
        console.error("Error uploading file to Gemini:", uploadError);
        throw new Error(
          `Failed to upload file: ${fileInput.localPath}. Error: ${
            (uploadError as Error).message || uploadError
          }`
        );
      }
    }

    const generationParams = {
      ...(llmOptions.maxOutputTokens && {
        maxOutputTokens: llmOptions.maxOutputTokens,
      }),
      ...(llmOptions.temperature && { temperature: llmOptions.temperature }),
      ...(llmOptions.topP && { topP: llmOptions.topP }),
      ...(llmOptions.topK && { topK: llmOptions.topK }),
    };

    const result = await this.genAIClient.models.generateContent({
      model: modelName,
      contents: geminiContent,
      ...generationParams,
    });
    return result;
  }

  public async runPrompt(
    request: PromptRequest
  ): Promise<GenerateContentResponse | string> {
    const { provider, modelName, messages, llmOptions = {}, file } = request;

    if (!messages || messages.length === 0) {
      throw new Error("Messages array cannot be empty.");
    }

    switch (provider) {
      case LLMProvider.GEMINI:
        return this._runGeminiPrompt(modelName, messages, llmOptions, file);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  public getCleanAIText(response: any): string {
    if (typeof response === "string") {
      return response
        .replace(/^```(json)?\s*/i, "")
        .replace(/```$/g, "")
        .trim();
    }

    if (response && typeof response.text === "function") {
      try {
        const text = response.text();
        return text
          .replace(/^```(json)?\s*/i, "")
          .replace(/```$/g, "")
          .trim();
      } catch (e) {
        console.warn(
          "Failed to extract text using response.text(). Trying older structure.",
          e
        );
      }
    }

    const raw =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return raw
      .replace(/^```(json)?\s*/i, "")
      .replace(/```$/g, "")
      .trim();
  }

  private getContinuationPromptForFile(previousFragment: string): string {
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

  public async tryGenerateFullJSON(
    requestBody: PromptRequest
  ): Promise<AIResponse> {
    const maxAttempts = 8;
    let lastAIResponseContent = "";
    let currentMessages: ChatMessage[] = [...requestBody.messages];

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
        ...requestBody,
        messages: [...currentMessages],
      };

      if (attempt > 0) {
        currentRequestBody.messages.push({
          role: "assistant",
          content: lastAIResponseContent,
        });

        try {
          const tempDir = os.tmpdir();
          tempFilePath = path.join(
            tempDir,
            `llm_context_${Date.now()}_${attempt}.txt`
          );
          await fs.writeFile(tempFilePath, lastAIResponseContent);
          currentRequestBody.contextFilePaths = [tempFilePath];

          currentRequestBody.messages.push({
            role: "user",
            content: `Your previous attempt to generate the JSON (also provided in the attached file at ${tempFilePath}) was incomplete or invalid. Please review our conversation history and the content of the attached file. Your task is to generate a *complete and valid* JSON object with 'content' (string) and 'summary' (string) fields. Ensure your output is only the final, corrected, and complete JSON structure. Do not repeat instructions.`,
          });
        } catch (fileError) {
          console.error(
            `Error creating temp file for AI context (attempt ${attempt + 1}):`,
            fileError
          );
          currentRequestBody.messages.push({
            role: "user",
            content: this.getContinuationPromptForFile(lastAIResponseContent),
          });
          currentRequestBody.contextFilePaths = undefined;
        }
      }

      let rawResponseFromAI = "";
      try {
        rawResponseFromAI = this.getCleanAIText(
          await this.runPrompt(currentRequestBody)
        );
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
          throw new Error(
            `AI call failed on the last attempt: ${errorMessage}`
          );
        }
        currentMessages = [...currentRequestBody.messages];
        continue;
      }

      if (tempFilePath) {
        await fs
          .unlink(tempFilePath)
          .catch((err) =>
            console.warn(`Failed to delete temp file ${tempFilePath}:`, err)
          );
      }

      lastAIResponseContent = rawResponseFromAI;

      try {
        const json = JSON.parse(rawResponseFromAI);
        if (json.content && json.summary) {
          return json as AIResponse;
        }
      } catch (_) {
        // Parsing failed. lastAIResponseContent is already set for next iteration.
      }

      if (attempt < maxAttempts - 1) {
        currentMessages = [...currentRequestBody.messages];
      }
    }

    try {
      const finalMerged = JSON.parse(lastAIResponseContent);
      if (finalMerged.content && finalMerged.summary)
        return finalMerged as AIResponse;
      throw new Error(
        "Final parsed JSON does not contain content and summary."
      );
    } catch (err) {
      console.error("Final parsing failed after all attempts:", err);
      throw new Error(
        "Could not generate a valid JSON with content and summary after multiple attempts."
      );
    }
  }
}
