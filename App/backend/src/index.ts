import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/user.routes";
import projectsRoutes from "./routes/project.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Define routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/projects", projectsRoutes);

app.get("/", (_req, res) => {
  res.send("API running 🚀");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
