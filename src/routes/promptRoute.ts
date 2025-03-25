import express from "express";
import { sendPrompt } from "../controllers/promptController";
const promptRouter = express.Router();

promptRouter.post("/prompt", sendPrompt);

export default promptRouter;
