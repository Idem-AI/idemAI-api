import { GoogleGenAI, createPartFromUri, Content, File } from "@google/genai";
import dotenv from "dotenv";
import * as fs from "fs-extra";
import logger from "../config/logger";
import betaRestrictionsService from './betaRestrictions.service';
import { userService } from "./user.service";
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
  userId?: string;
  promptType?: string;
  skipQuotaCheck?: boolean;
}

export interface AIResponse {
  content: string;
  summary: string;
}

export class PromptService {
  private genAIClient: GoogleGenAI;

  constructor() {
    logger.info('Initializing PromptService...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY is not set in environment variables.");
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    this.genAIClient = new GoogleGenAI({ apiKey });
    logger.info('GoogleGenAI client initialized successfully.');
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
  ): Promise<string> {
    const geminiContent: Content[] = this.toGeminiMessages(messages);

    if (fileInput && fileInput.localPath) {
      if (geminiContent.length === 0) {
        geminiContent.push({ role: "user", parts: [] });
      }

      try {
        // Ensure file is not empty before uploading as a potential workaround/diagnostic
        const fileStats = await fs.stat(fileInput.localPath);
        if (fileStats.size === 0) {
          logger.warn(
            `File ${fileInput.localPath} is empty. Writing a placeholder to avoid potential upload issues.`
          );
          await fs.writeFile(
            fileInput.localPath,
            "[Initial empty context]",
            "utf-8"
          );
        }

        logger.info(
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
          logger.error(
            "File upload response did not contain expected file details (uri or an effective mimeType)."
          );
          throw new Error(
            "File upload response did not contain expected file details (uri or an effective mimeType)."
          );
        }
        logger.info(
          `File uploaded successfully: URI ${uploadedFile.uri}, MimeType (from SDK): ${uploadedFile.mimeType}`
        );

        const filePart = createPartFromUri(uploadedFile.uri, effectiveMimeType);

        const lastMessageTurn = geminiContent[geminiContent.length - 1];
        if (!lastMessageTurn.parts) {
          lastMessageTurn.parts = [];
        }
        lastMessageTurn.parts.push(filePart);

        // run prompt
        const result = await this.genAIClient.models.generateContent({
          model: modelName,
          contents: geminiContent,
        });
        // Safely access the text content
        const firstCandidate = result.candidates?.[0];
        const firstPart = firstCandidate?.content?.parts?.[0];
        const textContent = firstPart?.text;

        if (typeof textContent === "string") {
          return textContent;
        } else {
          let detailedError = "Invalid response structure from Gemini API: ";
          if (!result.candidates || result.candidates.length === 0) {
            detailedError += "No candidates array or empty candidates array.";
          } else if (!firstCandidate) {
            detailedError +=
              "First candidate is undefined (candidates array might be sparse or malformed, or was empty).";
          } else if (!firstCandidate.content) {
            detailedError += "First candidate is missing 'content' property.";
          } else if (
            !firstCandidate.content.parts ||
            firstCandidate.content.parts.length === 0
          ) {
            detailedError +=
              "First candidate's content is missing 'parts' array or 'parts' array is empty.";
          } else if (!firstPart) {
            detailedError +=
              "First part of first candidate's content is undefined (parts array might be sparse or malformed, or was empty).";
          } else if (typeof firstPart.text !== "string") {
            detailedError +=
              "First part's 'text' property is missing or not a string.";
          } else {
            detailedError +=
              "textContent was not a string for an unknown reason after checks.";
          }
          logger.error(
            "Gemini API Error: " + detailedError + " Full response for debugging: " + JSON.stringify(result, null, 2)
          );
          logger.error("Invalid or empty response structure from Gemini API. " + detailedError);
          throw new Error(
            "Invalid or empty response structure from Gemini API. " +
              detailedError
          );
        }
      } catch (uploadError) {
        logger.error('Error uploading file to Gemini:', uploadError);
        const errorMessage = `Failed to upload file: ${fileInput.localPath}. Error: ${(uploadError as Error).message || uploadError}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
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
    const response = result.text;
    if (!response) {
      logger.error("Failed to generate response from Gemini API.");
      const runPromptErrorMessage = `Failed to run prompt: ${JSON.stringify(result, null, 2)}`;
      logger.error(runPromptErrorMessage);
      throw new Error(runPromptErrorMessage);
    }
    return response;
  }

  public async runPrompt(request: PromptRequest): Promise<string> {
    logger.info(`Running prompt for provider: ${request.provider}, model: ${request.modelName}, file attached: ${!!request.file}, userId: ${request.userId}`);
    const { provider, modelName, messages, llmOptions = {}, file, userId, promptType, skipQuotaCheck = false } = request;

    if (!messages || messages.length === 0) {
      logger.error("Messages array cannot be empty.");
      throw new Error("Messages array cannot be empty.");
    }

    // Quota checking for authenticated users (skip for system/internal calls)
    if (userId && !skipQuotaCheck) {
      logger.info(`Checking quota for user: ${userId}`);
      const quotaCheck = await userService.checkQuota(userId);
      
      if (!quotaCheck.allowed) {
        logger.warn(`Quota exceeded for user ${userId}: ${quotaCheck.message}`);
        throw new Error(quotaCheck.message || 'Quota exceeded');
      }
      
      logger.info(`Quota check passed for user ${userId}. Remaining: daily=${quotaCheck.remainingDaily}, weekly=${quotaCheck.remainingWeekly}`);
    }

    // Beta restrictions validation
    if (promptType) {
      const featureValidation = betaRestrictionsService.validateFeature(promptType);
      if (!featureValidation.allowed) {
        logger.warn(`Feature ${promptType} not allowed in beta: ${featureValidation.message}`);
        throw new Error(featureValidation.message || 'Feature not available in beta');
      }

      // Validate and adjust prompt parameters for beta
      const paramValidation = betaRestrictionsService.validatePromptParams(promptType, { llmOptions, ...request });
      if (!paramValidation.allowed) {
        logger.warn(`Prompt parameters not allowed in beta: ${paramValidation.message}`);
        throw new Error(paramValidation.message || 'Parameters not allowed in beta');
      }

      // Apply adjusted parameters if any
      if (paramValidation.adjustedParams) {
        Object.assign(request, paramValidation.adjustedParams);
        logger.info(`Applied beta parameter adjustments for ${promptType}`);
      }
    }

    // Input validation for user content
    if (userId && messages.length > 0) {
      const userMessage = messages.find(msg => msg.role === 'user');
      if (userMessage) {
        const inputValidation = betaRestrictionsService.validateInput(userMessage.content);
        if (!inputValidation.allowed) {
          logger.warn(`Invalid input from user ${userId}: ${inputValidation.message}`);
          throw new Error(inputValidation.message || 'Invalid input');
        }
      }
    }

    // Apply beta prompt modifications if needed
    let modifiedMessages = messages;
    if (betaRestrictionsService.isBetaMode() && messages.length > 0) {
      modifiedMessages = messages.map(msg => {
        if (msg.role === 'user' || msg.role === 'system') {
          return {
            ...msg,
            content: betaRestrictionsService.applyBetaPromptModifications(msg.content)
          };
        }
        return msg;
      });
      logger.info('Applied beta prompt modifications');
    }

    try {
      let result: string;
      switch (provider) {
        case LLMProvider.GEMINI:
          result = await this._runGeminiPrompt(modelName, modifiedMessages, llmOptions, file);
          break;
        default:
          const unsupportedProviderError = new Error(`Unsupported LLM provider: ${provider}`);
          logger.error(`Unsupported LLM provider encountered in runPrompt: ${unsupportedProviderError.message}`, { provider, stack: unsupportedProviderError.stack });
          throw unsupportedProviderError;
      }

      // Increment quota after successful API call
      if (userId && !skipQuotaCheck) {
        try {
          await userService.incrementUsage(userId);
          logger.info(`Incremented quota usage for user ${userId}`);
        } catch (quotaError) {
          logger.error(`Failed to increment quota for user ${userId}:`, quotaError);
          // Don't throw here as the API call was successful
        }
      }

      return result;
    } catch (error: any) {
      logger.error(`Error in runPrompt for provider ${provider}, model ${modelName}: ${error.message}`, { stack: error.stack, details: error });
      throw error;
    }
  }

  public getCleanAIText(response: any): string {
    logger.debug('Attempting to clean AI text response.');
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
      } catch (e: any) {
        logger.warn(
          `Failed to extract text using response.text(). Trying older structure. Error: ${e.message}`,
          { stack: e.stack, responseDetails: typeof response }
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
}
