import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { config } from "../../config/config";
import { LLMOptions } from "./llm.types";
import logger from "../../config/logger";

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!config.gemini.apiKey) {
      logger.error("GEMINI_API_KEY is not defined");
      throw new Error("GEMINI_API_KEY is not defined");
    }
    logger.info("GeminiService initialized");
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }

  async generateContent(
    modelName: string,
    prompt: string,
    options: LLMOptions = {
      maxOutputTokens: 990000,
      temperature: 0.9,
      topP: 1,
      topK: 100,
    }
  ): Promise<GenerateContentResult> {
    logger.info(`Generating content with model: ${modelName}`, { modelName, options });
    try {
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: options.maxOutputTokens ?? 99000,
          temperature: options.temperature ?? 0.9,
          topP: options.topP ?? 0.9,
          topK: options.topK ?? 100,
        },
      });

      const chat = model.startChat();
      const response = await chat.sendMessage(prompt);
      logger.info(`Content generated successfully with Gemini`, { modelName });
      return response;
    } catch (error) {
      logger.error(`Error generating content with Gemini`, { 
        modelName, 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}
