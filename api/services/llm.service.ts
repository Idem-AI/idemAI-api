import { GenerateContentResult } from "@google/generative-ai";
import { LLMProvider, PromptRequest, AIResponse } from "./llm/llm.types";
import { GeminiService } from "./llm/gemini.service";
import { DeepseekService } from "./llm/deepseek.service";

export class LLMService {
  private geminiService: GeminiService;
  private deepseekService: DeepseekService;

  constructor() {
    this.geminiService = new GeminiService();
    this.deepseekService = new DeepseekService();
  }

  async generateContent(request: PromptRequest): Promise<AIResponse> {
    const { provider, modelName, prompt, llmOptions, deepseekOptions } = request;

    try {
      switch (provider) {
        case LLMProvider.GEMINI: {
          const result = await this.geminiService.generateContent(
            modelName,
            prompt,
            llmOptions
          );
          return this.formatGeminiResponse(result, modelName);
        }
        case LLMProvider.DEEPSEEK: {
          const content = await this.deepseekService.generateContent(
            modelName,
            prompt,
            llmOptions,
            deepseekOptions
          );
          return {
            content,
            provider: LLMProvider.DEEPSEEK,
            modelName,
          };
        }
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error generating content with ${provider}:`, error);
      throw error;
    }
  }

  private formatGeminiResponse(result: GenerateContentResult, modelName: string): AIResponse {
    const response = result.response;
    return {
      content: response.text(),
      provider: LLMProvider.GEMINI,
      modelName,
    };
  }
}
