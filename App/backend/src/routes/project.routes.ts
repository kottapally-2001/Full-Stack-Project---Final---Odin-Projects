import { Router, RequestHandler } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware as RequestHandler, getProjects as RequestHandler);
router.get("/:id", authMiddleware as RequestHandler, getProjectById as RequestHandler);

// CREATE, UPDATE, DELETE PROJECTS
router.post("/", authMiddleware as RequestHandler, createProject as RequestHandler);
router.put("/:id", authMiddleware as RequestHandler, updateProject as RequestHandler);
router.delete("/:id", authMiddleware as RequestHandler, deleteProject as RequestHandler);

export default router;

