import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" }); 
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: "admin" | "user";
    };

    req.user = decoded;
    next(); 
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
