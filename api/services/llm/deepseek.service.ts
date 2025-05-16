import OpenAI from "openai";
import { config } from "../../config/config";
import { LLMOptions, DeepseekOptions } from "./llm.types";
import logger from "../../config/logger";

export class DeepseekService {
  private client: OpenAI;

  constructor() {
    if (!config.openrouter.apiKey) {
      logger.error("OPENROUTER_API_KEY is not defined");
      throw new Error("OPENROUTER_API_KEY is not defined");
    }
    logger.info("DeepseekService initialized");

    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: config.openrouter.apiKey,
    });
  }

  async generateContent(
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
    logger.info(`Generating content with model: ${modelName}`, {
      modelName,
      options,
    });
    try {
      const completion = await this.client.chat.completions.create(
        {
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          max_tokens: options.maxOutputTokens ?? 128000,
          temperature: options.temperature ?? 1.0,
        },
        {
          headers: {
            "HTTP-Referer":
              deepseekOptions.siteUrl ?? "https://lexi.pharaon.me",
            "X-Title": deepseekOptions.siteName ?? "Lexi API",
          },
        }
      );

      const response = completion.choices[0]?.message?.content || "";
      logger.info(`Content generated successfully`, {
        modelName,
        contentLength: response.length,
      });
      return response;
    } catch (error) {
      logger.error(`Error generating content with Deepseek`, {
        modelName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
