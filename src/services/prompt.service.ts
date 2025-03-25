import {
  GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { ChatHistory } from "../models/chatIstory";
require("dotenv").config();

export class PromptService {
  static async runGeminiPrompt(
    chatHistory: ChatHistory[],
    prompt: string
  ): Promise<GenerateContentResult> {
    console.log("chatHistory", chatHistory);
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    // const chat = model.startChat({
    //   history: [
    //     {
    //       role: "user",
    //       parts: [{ text: "Hello" }],
    //     },
    //     {
    //       role: "model",
    //       parts: [{ text: "Great to meet you. What would you like to know?" }],
    //     },
    //   ],
    // });

    console.log("chatHIstoryText", chat);
    return await chat.sendMessage(prompt);
  }
}
