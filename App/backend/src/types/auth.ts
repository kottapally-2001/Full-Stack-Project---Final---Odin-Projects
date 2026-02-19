import { Request } from "express";

export interface AuthRequest extends Request {
  file: any;
  req: { id: number; role: "admin" | "user"; };
  req: { id: number; role: "admin" | "user"; };
  user?: {
    username: any;
    username: any;
    id: number;
    role: "admin" | "user";
  };
}
