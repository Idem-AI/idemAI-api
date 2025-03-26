const express = require("express");
const app = express();

const port = process.env.PORT || 3000;

var cors = require("cors");
import {
  GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";

app.use(express.json());
// app.use(
//   cors({
//     origin: ["https://lexis.pharaon.me", "http://localhost:4200"],
//     methods: ["POST"],
//   })
// );

app.get("/", (req: any, res: any) => {
  res.status(201).json("Welcome to Lexis Api");
});

async function runGeminiPrompt(
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

export type ChatHistory = {
  role: string;
  parts: {
    text: string;
  }[];
};
app.use("/api/prompt", async (req: any, res: any) => {
  try {
    console.log("req.body", req.body);

    const content = await runGeminiPrompt(
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
});

app.listen(port, () => {
  console.log(`our application is running at port ${port}`);
});

module.exports = app;
