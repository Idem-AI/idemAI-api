import express, {
  Request,
  Response,
  NextFunction,
  CookieOptions,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/config";
import { LLMController } from "./controllers/llm.controller";
import * as admin from "firebase-admin";
import { initializeFirebase } from "./config/firebase.config";
import { authenticate, CustomRequest } from "./middleware/auth.middleware";
import { PromptRequest } from "./interfaces/llm.types";

// Initialize Firebase Admin
initializeFirebase();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(config.cors));

// Controllers
const llmController = new LLMController();

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Lexi API",
    status: "healthy",
  });
});

app.post("/generate", authenticate, (req: Request, res: Response) =>
  llmController.generateContent(req, res)
);

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

      const llmController = new LLMController();
      await llmController.generateContent(req, res);
    } catch (error) {
      next(error);
    }
  }
);

app.post("/api/sessionLogin", async (req, res) => {
  const idToken = req.body.idToken;

  const expiresIn = 14 * 24 * 60 * 60 * 1000; // 14 Days
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const options: CookieOptions = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: false,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };
    console.log("session", sessionCookie);
    console.log("options", options);
    res.cookie("session", sessionCookie, options);
    console.log("Succesfull Session save...");
    res.status(200).send({ success: true });
  } catch (error) {
    console.log(error);
    res.status(401).send("UNAUTHORIZED REQUEST!");
  }
});

app.get("/api/profile", async (req, res) => {
  const sessionCookie = req.cookies.session;

  console.log("sessionCookie", sessionCookie);

  try {
    const decodedToken = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    res.status(200).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthenticated" });
  }
});

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
  const maxAttempts = 8;
  let partialResult = "";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const prompt =
      attempt === 0 ? requestBody.prompt : getContinuationPrompt(partialResult);

    const rawResponse = await getCleanAIText(
      await runPrompt({ ...requestBody, prompt })
    );
    console.log(`Raw AI Response (attempt ${attempt + 1}):`, rawResponse);

    try {
      if (attempt > 0) {
        const json = JSON.parse(partialResult);
        console.log("Parsed JSON:", json);
        return json;
      }
      const json = JSON.parse(rawResponse);
      return json;
    } catch (_) {
      partialResult += rawResponse; // accumulate
    }
  }

  // Last chance parse
  try {
    console.log("finalMerged", partialResult);
    const finalMerged = JSON.parse(partialResult);
    return finalMerged;
  } catch (err) {
    console.error("Final parsing failed after 3 attempts:", err);
    throw new Error("Could not generate a valid JSON with content and summary");
  }
}

function getContinuationPrompt(previousFragment: any) {
  return `
this content is not complete and is not a valid JSON, please continue the JSON from the last line:
finally i want json formated like this:
{
  "content": "string",
  "summary": "string"
}
of course it is sum of all the previous content and the new content not repeating the previous content and not need to create for exemple the content and summary again, just continue the JSON from the last line:
this is the last line: 
just continue not repeating the previous content:
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

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;
