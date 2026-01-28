import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../types/auth";

export const getUsers = async (req: AuthRequest, res: Response) => {
  // Ensure the user is authenticated
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
