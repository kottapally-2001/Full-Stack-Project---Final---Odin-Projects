import { Router, RequestHandler } from "express";
import {
  getProjects,
  getProjectById,
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

//GET all projects
router.get(
  "/",
  authMiddleware as unknown as RequestHandler,
  getProjects as unknown as RequestHandler
);

//GET project by ID
router.get(
  "/:id",
  authMiddleware as unknown as RequestHandler,
  getProjectById as unknown as RequestHandler
);

export default router;
