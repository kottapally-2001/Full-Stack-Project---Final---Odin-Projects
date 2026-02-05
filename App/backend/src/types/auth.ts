// src/types/auth.ts
import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: "admin" | "user";
  };
}
