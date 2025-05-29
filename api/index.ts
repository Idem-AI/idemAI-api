import express, { Request, Response } from "express";
import admin from "firebase-admin";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRoutes } from './routes/auth.routes';
import { promptRoutes } from './routes/prompt.routes'; 

dotenv.config();

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

if (serviceAccountFromEnv.project_id && serviceAccountFromEnv.private_key) {
  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccountFromEnv as admin.ServiceAccount
    ),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log("Firebase Admin SDK initialized successfully.");
} else {
  console.error(
    "Firebase Admin SDK initialization failed: Missing credentials in environment variables."
  );
}

import { projectRoutes } from "./routes/project.routes";
import { brandingRoutes } from "./routes/branding.routes";
import { diagramRoutes } from './routes/diagram.routes';
import { businessPlanRoutes } from './routes/businessPlan.routes';
import { deploymentRoutes } from './routes/deployment.routes';

const app = express();
const port = process.env.PORT || 3000;
app.use(cookieParser());

app.use(express.json());
const allowedOrigins = [
  "http://localhost:4200", 
  "http://localhost:3001", 
  "http://localhost:5173", 
  "https://lexi.pharaon.me", 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/projects", projectRoutes);
app.use('/api/project', brandingRoutes);
app.use('/api/project', diagramRoutes);
app.use('/api/project', businessPlanRoutes);
app.use('/api/project', deploymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/prompt', promptRoutes); 

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Lexi API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response /*, next: NextFunction */) => { 
  console.error("Global error handler:", err);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { admin }; 

export default app;
