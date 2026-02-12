import { Router, RequestHandler } from "express";
import {
  chatWithAI,
  getWelcomeMessage,
} from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/chat",
  authMiddleware as RequestHandler,
  chatWithAI as RequestHandler
);

router.get(
  "/welcome",
  authMiddleware as RequestHandler,
  getWelcomeMessage as RequestHandler
);

export default router;
