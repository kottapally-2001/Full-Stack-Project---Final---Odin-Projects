import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    username: any;
    username: any;
    id: number;
    role: "admin" | "user";
  };
}
