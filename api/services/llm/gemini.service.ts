import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { config } from "../../config/config";
import { LLMOptions } from "./llm.types";

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!config.gemini.apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
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
    return await chat.sendMessage(prompt);
  }
}
