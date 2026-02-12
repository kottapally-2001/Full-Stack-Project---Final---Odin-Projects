import { z } from "zod";

//REGISTER 
export const RegisterSchema = z.object({
username: z
.string()
.min(3, "Username must be at least 3 characters"),
password: z
.string()
.min(6, "Password must be at least 6 characters"),
role: z.enum(["admin", "user"]),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;

//LOGIN  
export const LoginSchema = z.object({
username: z.string().min(3, "Username is required"),
password: z.string().min(6, "Password is required"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
