import express from "express";
import cors from "cors";

import { authMiddleware } from "./middleware/auth.middleware";
import projectRoutes from "./routes/project.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/users", userRoutes);

export default app;
