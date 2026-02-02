import { Router, RequestHandler } from "express";
import { getUsers, updateUserRole } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// GET ALL USERS
router.get(
  "/",
  authMiddleware as RequestHandler,
  getUsers as RequestHandler
);

// UPDATE USER ROLE
router.put(
  "/:id/role",
  authMiddleware as RequestHandler,
  updateUserRole as RequestHandler
);

export default router;
