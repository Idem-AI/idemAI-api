import { Router } from "express";
import { authenticate } from "../services/auth.service";
import { promptController } from "../controllers/prompt.controller";
import { checkQuota } from "../middleware/quota.middleware";

export const promptRoutes = Router();

// This will be mounted at /api/prompt, so the route here is just '/'
promptRoutes.post(
  "/prompt",
  authenticate,
  checkQuota,
  promptController.handlePromptRequest
);
