import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { prisma } from "../config/prisma";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "phi3:latest";

/* ===================== CHAT ===================== */

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    const lowerMessage = message.toLowerCase();
    let context = "";

    /* ===== PROJECT QUERIES ===== */

    if (lowerMessage.includes("project")) {
      const projects =
        req.user.role === "admin"
          ? await prisma.project.findMany()
          : await prisma.project.findMany({
              where: { restricted: false },
            });

      if (projects.length === 0) {
        context = "There are no available projects.";
      } else {
        context = "Available Projects:\n\n";

        projects.forEach((project, index) => {
          context += `${index + 1}. ${project.title}\n`;
          context += `Description: ${project.description}\n`;
          context += `Git: ${project.gitUrl}\n`;
          context += `Preview: ${project.previewUrl}\n\n`;
        });
      }
    }

    /* ===== USER QUERIES ===== */

    if (lowerMessage.includes("user") && req.user.role === "admin") {
      const users = await prisma.user.findMany({
        select: { username: true, role: true },
      });

      context += `Total Users: ${users.length}\n\n`;

      users.forEach((user, index) => {
        context += `${index + 1}. ${user.username} (${user.role})\n`;
      });
    }

    /* ===== OLLAMA CALL ===== */

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: `
You are an AI assistant for a project management application.

User Name: ${req.user.username}
User Role: ${req.user.role}

Database Context:
${context || "No specific context available."}

User Question:
${message}

Give clear, structured, professional response.
`,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error("Ollama server not responding");
    }

    const data = await ollamaResponse.json();

    return res.status(200).json({
      reply: data.response || "No response from model",
    });
  } catch (error: any) {
    console.error("🔥 AI ERROR:", error.message);
    return res.status(500).json({
      message: "AI request failed",
    });
  }
};

/* ===================== WELCOME MESSAGE ===================== */

export const getWelcomeMessage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectCount =
      req.user.role === "admin"
        ? await prisma.project.count()
        : await prisma.project.count({
            where: { restricted: false },
          });

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: `
Generate a short friendly welcome message.

User Name: ${req.user.username}
User Role: ${req.user.role}
Available Projects: ${projectCount}

Mention their name and role.
Encourage them to explore projects.
Keep it short and professional.
`,
        stream: false,
      }),
    });

    const data = await ollamaResponse.json();

    return res.json({
      reply: data.response,
    });
  } catch (error) {
    console.error("WELCOME ERROR:", error);
    return res.status(500).json({
      message: "Failed to load welcome message",
    });
  }
};
