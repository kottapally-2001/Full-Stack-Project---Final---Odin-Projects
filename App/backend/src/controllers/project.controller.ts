import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { prisma } from "../config/prisma";

/* =========================
   GET ALL PROJECTS
========================= */
export const getProjects = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const projects =
    req.user.role === "admin"
      ? await prisma.project.findMany()
      : await prisma.project.findMany({
          where: { restricted: false },
        });

  res.json(projects);
};

/* =========================
   GET PROJECT BY ID
========================= */
export const getProjectById = async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.restricted && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json(project);
};

/* =========================
   CREATE PROJECT (ADMIN)
========================= */
export const createProject = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  const project = await prisma.project.create({
    data: req.body,
  });

  res.json(project);
};

/* =========================
   UPDATE PROJECT (ADMIN)
========================= */
export const updateProject = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  const projectId = Number(req.params.id);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: req.body,
  });

  res.json(project);
};

/* =========================
   DELETE PROJECT (ADMIN)
========================= */
export const deleteProject = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  const projectId = Number(req.params.id);

  await prisma.project.delete({
    where: { id: projectId },
  });

  res.json({ message: "Project deleted" });
};
