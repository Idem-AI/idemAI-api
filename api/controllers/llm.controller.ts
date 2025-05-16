import { Request, Response } from "express";
import { LLMService } from "../services/llm.service";
import { PromptRequest } from "../interfaces/llm.types";

export class LLMController {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  generateContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const promptRequest: PromptRequest = req.body;
      const response = await this.llmService.generateContent(promptRequest);
      res.json(response);
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ 
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
}
