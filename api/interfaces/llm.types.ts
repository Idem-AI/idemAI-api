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

export interface AIResponse {
  content: string;
  provider: LLMProvider;
  modelName: string;
}
