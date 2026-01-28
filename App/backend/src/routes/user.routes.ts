import { Router, RequestHandler } from "express";
import { getUsers } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware as RequestHandler, getUsers as RequestHandler);

export default router;
