import express from "express";
import { PromptService } from "../services/prompt.service";
import { ChatHistory } from "../models/chatIstory";
const app = express();

export const sendPrompt = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    console.log("req.body", req.body);
    const content = await PromptService.runGeminiPrompt(
      req.body.history as ChatHistory[],
      req.body.prompt
    );

    console.log("content", content);
    res.status(201).json({
      message: req.body,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
