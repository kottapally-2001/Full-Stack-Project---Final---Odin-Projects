import { Router, RequestHandler } from "express";
import { register, login, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware as RequestHandler, me);

export default router;
