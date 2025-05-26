import { Response } from 'express';
import { CustomRequest } from '../interfaces/express.interface';
import {
  PromptRequest,
  tryGenerateFullJSON,
  runPrompt as runPromptService, // Alias to avoid conflict if runPrompt is used locally
} from '../services/prompt.service';

class PromptController {
  async handlePromptRequest(req: CustomRequest, res: Response): Promise<void> {
    try {
      const requestBody: PromptRequest = req.body;

      if (
        !requestBody.provider ||
        !requestBody.modelName ||
        !requestBody.prompt
      ) {
        res.status(400).json({
          error: "Missing required fields: provider, modelName or prompt",
        });
        return;
      }

      // Pass the runPrompt function from the service to tryGenerateFullJSON
      const jsonResponse = await tryGenerateFullJSON(requestBody, runPromptService);
      res.status(200).json(jsonResponse);
    } catch (error: any) {
      console.error("Error in PromptController:", error);
      // Check if the error has a message property, otherwise send a generic error
      const errorMessage = error.message || 'Something broke during prompt processing!';
      res.status(500).send({ error: errorMessage });
    }
  }
}

export const promptController = new PromptController();
