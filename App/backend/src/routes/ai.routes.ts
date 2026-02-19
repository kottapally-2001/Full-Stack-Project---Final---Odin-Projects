import { Router } from "express";
import { chatWithAI, getWelcomeMessage } from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload";

const router = Router();

// 🟢 Welcome message
router.get("/welcome", authMiddleware, getWelcomeMessage);

// 🟢 Chat with file upload
router.post(
  "/chat",
  authMiddleware,
  upload.single("file"),   // multer middleware
  chatWithAI
);

export default router;

