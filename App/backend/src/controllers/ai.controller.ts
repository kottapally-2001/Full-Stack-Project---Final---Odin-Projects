import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { prisma } from "../config/prisma";
import fs from "fs";
const pdfParse = require("pdf-parse");
import ffmpeg from "fluent-ffmpeg";
import whisper from "openai-whisper";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const TEXT_MODEL = "phi3";
const VISION_MODEL = "llava";

// TEXT CHUNK 
const chunkText = (text: string, size = 3500) => {
const chunks = [];
for (let i = 0; i < text.length; i += size) {
chunks.push(text.slice(i, i + size));
}
return chunks;
};

// CHAT 
export const chatWithAI = async (req: AuthRequest, res: Response) => {
try {
if (!req.user) return res.status(401).json({ message: "Unauthorized" });

const message = req.body.message || "";
const msg = message.toLowerCase().trim();

let fileText = "";
const file: any = req.file;

// FILE HANDLING
if (file) {
  console.log("📂 File received:", file.originalname);

  // PDF
  if (file.mimetype === "application/pdf") {
    const buffer = fs.readFileSync(file.path);
    const data = await pdfParse(buffer);

    const chunks = chunkText(data.text || "");
    fileText = chunks.slice(0, 2).join("\n"); // fast analysis
  }

  // IMAGE (VISION AI)
  else if (file.mimetype.startsWith("image")) {
    const imageBase64 = fs.readFileSync(file.path, { encoding: "base64" });

    const visionRes = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: VISION_MODEL,
        prompt:
          "Deeply analyze this image. Detect objects, people, text, issues and explain clearly.",
        images: [imageBase64],
        stream: false,
        keep_alive: 0,
      }),
    });

    const visionData = await visionRes.json();
    return res.json({ reply: visionData.response || "Image analyzed" });
  }

  // AUDIO
  else if (file.mimetype.startsWith("audio")) {
    const result: any = await whisper.transcribe(file.path);
    fileText = result.text;
  }

  // VIDEO 
  else if (file.mimetype.startsWith("video")) {
    const audioPath = file.path + ".mp3";

    await new Promise((resolve) => {
      ffmpeg(file.path).output(audioPath).on("end", resolve).run();
    });

    const result: any = await whisper.transcribe(audioPath);
    fileText = result.text;
  }
}

// CREATE PROJECT 
if (msg.startsWith("create project")) {
  const title = message.replace(/create project/i, "").trim();
  if (!title) return res.json({ reply: "Tell project name." });

  const newProject = await prisma.project.create({
    data: {
      title,
      description: "Created by AI",
      gitUrl: "",
      previewUrl: "",
      restricted: false,
    },
  });

  return res.json({ reply: `✅ Project "${newProject.title}" created` });
}

// DELETE PROJECT 
if (msg.startsWith("delete project")) {
  const title = message.replace(/delete project/i, "").trim();
  if (!title) return res.json({ reply: "Tell project name to delete." });

  const deleted = await prisma.project.deleteMany({
    where: { title: { contains: title, mode: "insensitive" } },
  });

  if (deleted.count === 0)
    return res.json({ reply: "Project not found." });

  return res.json({ reply: `🗑 Project "${title}" deleted.` });
}

// DELETE USER 
if (msg.startsWith("delete user")) {
  if (req.user.role !== "admin")
    return res.json({ reply: "Only admin can delete users." });

  const username = message.replace(/delete user/i, "").trim();
  if (!username) return res.json({ reply: "Tell username." });

  const deleted = await prisma.user.deleteMany({
    where: { username: { contains: username, mode: "insensitive" } },
  });

  if (deleted.count === 0)
    return res.json({ reply: "User not found." });

  return res.json({ reply: `👤 User "${username}" deleted.` });
}

// ANALYTICS 
if (msg.includes("analytics")) {
  const totalProjects = await prisma.project.count();
  const totalUsers = await prisma.user.count();

  return res.json({
    reply: `📊 System Analytics

• Total Users: ${totalUsers}
• Total Projects: ${totalProjects}
• Status: Running perfectly 🚀`,
  });
}

// SHOW PROJECTS 
if (msg.includes("show projects") || msg === "4") {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }, // optional
  });

  if (!projects.length) {
    return res.json({ reply: "No projects found." });
  }

  let reply = "📁 Projects List:\n\n";

  projects.forEach((p, i) => {
    reply += `${i + 1}. ${p.title} - ${p.description || "No description"}\n`;
  });

  return res.json({ reply });
}



// SHOW USERS 
if (msg.includes("show users") || msg === "5") {
  const users = await prisma.user.findMany({
    select: { username: true, role: true },
  });

  if (!users.length) {
    return res.json({ reply: "No users found" });
  }

  let reply = "👥 Users List:\n\n";
  users.forEach((u, i) => {
    reply += `${i + 1}. ${u.username} (${u.role})\n`;
  });

  return res.json({ reply });
}



// PROJECT CONTEXT 
const projects = await prisma.project.findMany({
  select: { title: true, description: true },
  take: 10,
});

let context = "PROJECT DATABASE:\n";
projects.forEach((p, i) => {
  context += `${i + 1}. ${p.title} - ${p.description}\n`;
});

// USERS CONTEXT
const users = await prisma.user.findMany({
  select: { username: true, role: true },
  take: 10,
});

let usersContext = "USERS DATABASE:\n";
users.forEach((u, i) => {
  usersContext += `${i + 1}. ${u.username} (${u.role})\n`;
});

// FINAL PROMPT 
let finalPrompt = `
You are an intelligent AI inside company dashboard.

RULES:
- Give clear smart answers
- Be accurate
- Avoid long unnecessary text
- Be professional

User: ${req.user.username}
Role: ${req.user.role}

DATABASE:
${context}
`;

if (fileText) {
  finalPrompt += `
FILE CONTENT:
${fileText}

DATABASE:
${context}

USER DATABASE:
${usersContext}


TASK:
Analyze and summarize with insights.
`;
}

if (message) {
  finalPrompt += `
USER QUESTION:
${message}
`;
}

// TEXT AI CALL 
const ollamaResponse = await fetch(OLLAMA_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: TEXT_MODEL,
    prompt: finalPrompt,
    stream: false,
    keep_alive: 0,
    options: {
      temperature: 0.1,
      num_predict: 150,
      num_ctx: 2048,
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

// WELCOME 
export const getWelcomeMessage = async (req: AuthRequest, res: Response) => {
try {
if (!req.user) return res.status(401).json({ message: "Unauthorized" });

return res.json({
  reply: `Welcome ${req.user.username} 👋
Upload PDF, image, audio or video and ask anything.`,
});
} catch {
return res.status(500).json({ message: "Failed" });
}
};

