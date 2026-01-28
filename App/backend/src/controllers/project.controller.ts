import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { projects } from "../projects";

export const getProjects = (req: AuthRequest, res: Response) => {

  //BLOCK unauthenticated users
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Admin → all projects
  if (req.user.role === "admin") {
    return res.json(projects);
  }

  // User → only non-restricted projects
  return res.json(projects.filter(p => !p.restricted));
};


// GET single project by ID

export const getProjectById = (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // protect restricted projects
  if (project.restricted && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  return res.json(project);
};
