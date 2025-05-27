import { Router } from "express";
import { authenticate } from "../services/auth.service";
import { promptController } from "../controllers/prompt.controller";

export const promptRoutes = Router();

// This will be mounted at /api/prompt, so the route here is just '/'
promptRoutes.post("/", authenticate, promptController.handlePromptRequest);
