import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { prisma } from "../config/prisma";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "phi3:latest";

// CHAT WITH AI

export const chatWithAI = async (req: AuthRequest, res: Response) => {
try {
if (!req.user) {
  return res.status(401).json({ message: "Unauthorized" });
}

const { message } = req.body;
if (!message || typeof message !== "string") {
  return res.status(400).json({ message: "Message is required" });
}

const msg = message.toLowerCase().trim();

// CREATE PROJECT

if (msg.startsWith("create project")) {
  const title = message.replace(/create project/i, "").trim();

  if (!title) {
    return res.json({ reply: "Tell project name to create." });
  }

  const newProject = await prisma.project.create({
    data: {
      title,
      description: "Created by AI assistant",
      gitUrl: "",
      previewUrl: "",
      restricted: false,
    },
  });

  return res.json({
    reply: `✅ Project "${newProject.title}" created successfully`,
  });
}

// DELETE PROJECT 

if (msg.startsWith("delete project")) {
  const title = message.replace(/delete project/i, "").trim();

  const project = await prisma.project.findFirst({
    where: { title: { contains: title, mode: "insensitive" } },
  });

  if (!project) {
    return res.json({ reply: "Project not found." });
  }

  await prisma.project.delete({
    where: { id: project.id },
  });

  return res.json({
    reply: `🗑️ Project "${project.title}" deleted`,
  });
}

// ADD USER

if (msg.startsWith("create user") || msg.startsWith("add user")) {
  if (req.user.role !== "admin") {
    return res.json({ reply: "Only admin can create users 👮" });
  }

  let clean = message
    .replace(/create user/i, "")
    .replace(/add user/i, "")
    .trim();

  const parts = clean.split(" ");

  if (parts.length < 2) {
    return res.json({
      reply:
        "Tell username and role.\nExample: sai user  OR  ram admin",
    });
  }

  const username = parts[0];
  const role = parts[1]?.toLowerCase() === "admin" ? "admin" : "user";

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    return res.json({ reply: "User already exists." });
  }

  const newUser = await prisma.user.create({
    data: {
      username,
      password: "12345678",
      role,
    },
  });

  return res.json({
    reply: `👤 User "${newUser.username}" created (${newUser.role})\nPassword: 123456`,
  });
}

// SHOW USERS 

if (msg.includes("users")) {
  if (req.user.role !== "admin") {
    return res.json({ reply: "Only admin can view users 👮" });
  }

  const users = await prisma.user.findMany({
    select: { username: true, role: true },
  });

  if (users.length === 0) {
    return res.json({ reply: "No users found." });
  }

  let text = `👥 Users List:\n\n`;
  users.forEach((u, i) => {
    text += `${i + 1}. ${u.username} (${u.role})\n`;
  });

  return res.json({ reply: text });
}

// DELETE USER 

if (msg.startsWith("delete user") || msg.startsWith("remove user")) {
  if (req.user.role !== "admin") {
    return res.json({ reply: "Only admin can delete users 👮" });
  }

  const username = message
    .replace(/delete user/i, "")
    .replace(/remove user/i, "")
    .trim();

  if (!username) {
    return res.json({
      reply: "Tell username to delete.\nExample: delete user ram",
    });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.json({ reply: "User not found." });
  }

  if (user.username === req.user.username) {
    return res.json({
      reply: "You cannot delete yourself 😅",
    });
  }

  await prisma.user.delete({
    where: { username },
  });

  return res.json({
    reply: `🗑️ User "${username}" deleted successfully`,
  });
}

// ANALYTICS 

if (msg.includes("analytics") || msg.includes("stats")) {
  const totalProjects = await prisma.project.count();
  const totalUsers = await prisma.user.count();

  return res.json({
    reply: `📊 Dashboard Analytics:
👨‍💻 Users: ${totalUsers}
📁 Projects: ${totalProjects}
🚀 System running smoothly`,
  });
}
// ADMIN INFO 

if (msg.includes("admin")) {
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { username: true },
  });

  const adminList = admins.map(a => a.username).join(", ");
  return res.json({ reply: `👑 Admins: ${adminList}` });
}

// FETCH CONTEXT

const [projects, users] = await Promise.all([
  req.user.role === "admin"
    ? prisma.project.findMany({
        select: { title: true, description: true },
      })
    : prisma.project.findMany({
        where: { restricted: false },
        select: { title: true, description: true },
      }),

  req.user.role === "admin"
    ? prisma.user.findMany({
        select: { username: true, role: true },
      })
    : Promise.resolve([]),
]);

let context = `PROJECTS:\n`;

if (projects.length === 0) {
  context += "No projects available.\n";
} else {
  projects.forEach((p, i) => {
    context += `${i + 1}. ${p.title} - ${p.description}\n`;
  });
}

if (req.user.role === "admin") {
  context += `\nUSERS:\n`;
  users.forEach((u: any, i: number) => {
    context += `${i + 1}. ${u.username} (${u.role})\n`;
  });
}

// OLLAMA CALL 

const ollamaResponse = await fetch(OLLAMA_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: MODEL_NAME,
    prompt: `
You are an AI assistant inside a project management dashboard.
Answer only about projects and users.
Keep answers short.

User: ${req.user.username}
Role: ${req.user.role}

DATABASE:
${context}

User Question:
${message}
`,
    stream: false,
    options: {
      temperature: 0.1,
      num_predict: 120,
    },
  }),
});

const data = await ollamaResponse.json();
let reply = data.response || "No response";
reply = reply.replace(/```/g, "").trim();

return res.json({ reply });

} catch (error: any) {
console.error("🔥 AI ERROR:", error.message);
return res.status(500).json({ message: "AI request failed" });
}
};

// WELCOME MESSAGE

export const getWelcomeMessage = async (req: AuthRequest, res: Response) => {
try {
if (!req.user) {
  return res.status(401).json({ message: "Unauthorized" });
}

return res.json({
  reply: `Welcome ${req.user.username} 👋 Ask me about projects or users.`,
});
} catch {
return res.status(500).json({ message: "Failed to load welcome" });
}
};
