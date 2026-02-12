import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { RegisterSchema, LoginSchema } from "../dtos/auth.dto";
import { AuthRequest } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

//REGISTER USER
export const register = async (req: Request, res: Response) => {
const parsed = RegisterSchema.safeParse(req.body);

if (!parsed.success) {
return res.status(400).json({
errors: parsed.error.flatten().fieldErrors,
});
}

const { username, password, role } = parsed.data;

const exists = await prisma.user.findUnique({ where: { username } });
if (exists) {
return res.status(400).json({ message: "User already exists" });
}

const hashed = await bcrypt.hash(password, 10);

await prisma.user.create({
data: { username, password: hashed, role },
});

res.status(201).json({ message: "User registered successfully" });
};

//LOGIN USER 
export const login = async (req: Request, res: Response) => {
const parsed = LoginSchema.safeParse(req.body);

if (!parsed.success) {
return res.status(400).json({
errors: parsed.error.flatten().fieldErrors,
});
}

const { username, password } = parsed.data;

const user = await prisma.user.findUnique({ where: { username } });
if (!user) {
return res.status(400).json({ message: "Invalid credentials" });
}

const match = await bcrypt.compare(password, user.password);
if (!match) {
return res.status(400).json({ message: "Invalid credentials" });
}

const token = jwt.sign(
{ id: user.id, role: user.role },
JWT_SECRET,
{ expiresIn: "1h" }
);

res.json({ token, role: user.role });
};

export const me = (req: AuthRequest, res: Response) => {
res.json({
id: req.user?.id,
role: req.user?.role,
});
};
