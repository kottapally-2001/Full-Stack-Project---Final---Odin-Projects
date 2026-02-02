import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../types/auth";

export const getUsers = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  res.json(users);
};

// UPDATE USER ROLE
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ADMIN ONLY
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  const userId = Number(req.params.id);
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // PREVENT SELF-ROLE CHANGE
  if (req.user.id === userId) {
    return res.status(400).json({ message: "Cannot change your own role" });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  return res.json(updatedUser);
};
