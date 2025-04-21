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
    maxOutputTokens: 40000,
    temperature: 0.9,
    topP: 1,
    topK: 100,
  }
): Promise<GenerateContentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 40000,
      temperature: options.temperature ?? 0.9,
      topP: options.topP ?? 0.9,
      topK: options.topK ?? 100,
    },
  });

  const chat = model.startChat();
  return await chat.sendMessage(prompt);
}

async function runDeepseekPrompt(
  modelName: string,
  prompt: string,
  options: LLMOptions = {
    maxOutputTokens: 158000, // Valeur maximale supportée par l'API
    temperature: 1, // Évitez les valeurs trop extrêmes pour garder la cohérence
    topP: 1.0, // Permet la plus large sélection de tokens
    topK: 100, // Conservez une valeur raisonnable pour la diversité
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
    max_tokens: options.maxOutputTokens ?? 128000,
    temperature: options.temperature ?? 1.0,
  });
  console.log("Raw AI Response:", completion);

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

      const json = await tryGenerateFullJSON(requestBody, runPrompt);
      res.status(200).json(json);
    } catch (error) {
      next(error);
    }
  }
);

function getCleanAIText(response: any): string {
  const raw =
    typeof response === "string"
      ? response
      : response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return raw
    .replace(/^```(json)?\s*/i, "")
    .replace(/```$/g, "")
    .trim();
}

async function tryGenerateFullJSON(
  requestBody: any,
  runPrompt: any
): Promise<any> {
  const maxAttempts = 2;
  let partialResult = "";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const prompt =
      attempt === 0 ? requestBody.prompt : getContinuationPrompt(partialResult);

    const rawResponse = await getCleanAIText(
      await runPrompt({ ...requestBody, prompt })
    );
    console.log(`Raw AI Response (attempt ${attempt + 1}):`, rawResponse);

    try {
      const json = JSON.parse(rawResponse);
      return json; // fully parsed!
    } catch (_) {
      partialResult += rawResponse; // accumulate
    }
  }

  // Last chance parse
  try {
    const finalMerged = JSON.parse(partialResult);
    return finalMerged;
  } catch (err) {
    console.error("Final parsing failed after 3 attempts:", err);
    throw new Error("Could not generate a valid JSON with content and summary");
  }
}

function getContinuationPrompt(previousFragment: any) {
  return `
You previously generated an incomplete JSON object due to output limits.

⚠️ Your task:
Continue **only** the remaining part of the JSON object **without repeating** any of the existing structure or content.

🚫 STRICT RULES:
- Do NOT repeat or re-generate existing keys or values.
- Do NOT start a new object or array.
- Do NOT include any comments, explanations, or code blocks.
- Only return the RAW JSON continuation, beginning **exactly** where it left off.

Here is the existing partial JSON fragment:
${previousFragment.trim()}
`.trim();
}

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
