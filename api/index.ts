import express, { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import {
  GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import cors from "cors";
// Initialiser Firebase Admin SDK
// import serviceAccount from "../firebase-admin.json";
const serviceAccountFromEnv = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
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
    origin: ["https://lexis.pharaon.me", "http://localhost:4200"],
    methods: ["POST"],
  })
);

// Middleware pour vérifier l'authentification Firebase
async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const idToken = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    return next(); // ✅ Ajout d'un `return next();`
  } catch (error) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
}

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to Lexis API");
});

export type ChatHistory = {
  role: string;
  parts: {
    text: string;
  }[];
};

async function runGeminiPrompt(
  chatHistory: ChatHistory[],
  prompt: string
): Promise<GenerateContentResult> {
  console.log("chatHistory", chatHistory);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: chatHistory,
    generationConfig: { maxOutputTokens: 100 },
  });

  return await chat.sendMessage(prompt);
}

app.post("/api/prompt", authenticate, async (req: Request, res: Response) => {
  try {
    console.log("req.body", req.body);

    const content = await runGeminiPrompt(req.body.history, req.body.prompt);

    res.status(201).json({
      message: content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Application running at port ${port}`);
});

export default app;
