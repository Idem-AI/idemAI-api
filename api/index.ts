import express, { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export enum LLMProvider {
  GEMINI = "GEMINI",
  DEEPSEEK = "DEEPSEEK",
}

interface LLMOptions {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

interface DeepseekOptions {
  siteUrl?: string;
  siteName?: string;
}

interface PromptRequest {
  provider: LLMProvider;
  modelName: string;
  prompt: string;
  llmOptions?: LLMOptions;
  deepseekOptions?: DeepseekOptions;
}

interface AIResponse {
  content: string;
  summary: string;
}

interface CustomRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

const serviceAccountFromEnv = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(
    serviceAccountFromEnv as admin.ServiceAccount
  ),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: ["https://lexi.pharaon.me", "http://localhost:4200"],
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

async function authenticate(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
}

async function runGeminiPrompt(
  modelName: string,
  prompt: string,
  options: LLMOptions = {
    maxOutputTokens: 10000,
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
  }
): Promise<GenerateContentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 2048,
      temperature: options.temperature ?? 0.9,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 40,
    },
  });

  const chat = model.startChat();
  return await chat.sendMessage(prompt);
}

async function runDeepseekPrompt(
  modelName: string,
  prompt: string,
  options: LLMOptions = {
    maxOutputTokens: 100000,
    temperature: 2,
    topP: 2,
    topK: 100,
  },
  deepseekOptions: DeepseekOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not defined");

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": deepseekOptions.siteUrl ?? "https://lexi.pharaon.me",
      "X-Title": deepseekOptions.siteName ?? "Lexi API",
    },
  });

  const completion = await client.chat.completions.create({
    model: modelName,
    messages: [{ role: "user", content: prompt }],
    max_tokens: options.maxOutputTokens ?? 2048,
    temperature: options.temperature ?? 0.7,
  });

  return completion.choices[0]?.message?.content || "";
}

async function runPrompt(
  request: PromptRequest
): Promise<GenerateContentResult | string> {
  const {
    provider,
    modelName,
    prompt,
    llmOptions = {},
    deepseekOptions = {},
  } = request;

  switch (provider) {
    case LLMProvider.GEMINI:
      console.log("Running Gemini prompt...");
      return runGeminiPrompt(modelName, prompt, llmOptions);
    case LLMProvider.DEEPSEEK:
      console.log("Running Deepseek prompt...");
      return runDeepseekPrompt(modelName, prompt, llmOptions, deepseekOptions);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

function parseAIResponse(responseText: string): AIResponse {
  const cleanedText = responseText
    .replace(/^```(json)?\s*/, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedText);

    if (
      typeof parsed.content !== "string" ||
      typeof parsed.summary !== "string"
    ) {
      throw new Error(
        "Invalid format: 'content' and 'summary' must be strings"
      );
    }

    return parsed as AIResponse;
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    throw new Error(`Invalid AI response format: ${(err as Error).message}`);
  }
}

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Lexi API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.post(
  "/api/prompt",
  authenticate,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
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

      const content = await runPrompt(requestBody);
      const responseText =
        typeof content === "string"
          ? content
          : content.response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        res.status(500).json({ error: "No response from AI" });
        return;
      }

      console.log("Raw AI Response:", responseText);

      try {
        const parsed = parseAIResponse(responseText);
        res.status(200).json(parsed);
      } catch (error) {
        res.status(400).json({
          error: error instanceof Error ? error.message : "Invalid AI response",
          raw: responseText,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
