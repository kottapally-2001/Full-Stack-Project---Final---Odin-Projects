import { Router, RequestHandler } from "express";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.get(
  "/",
  authMiddleware as RequestHandler,
  adminMiddleware as RequestHandler,
  getUsers as RequestHandler
);

router.put(
  "/:id/role",
  authMiddleware as RequestHandler,
  adminMiddleware as RequestHandler,
  updateUserRole as RequestHandler
);

router.delete(
  "/:id",
  authMiddleware as RequestHandler,
  adminMiddleware as RequestHandler,
  deleteUser as RequestHandler
);

export default router;
