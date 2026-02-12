import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";

export const adminMiddleware = (
req: AuthRequest,
res: Response,
next: NextFunction
) => {
if (req.user?.role !== "admin") {
return res.status(403).json({ message: "Admin access required" });
}
next();
};
