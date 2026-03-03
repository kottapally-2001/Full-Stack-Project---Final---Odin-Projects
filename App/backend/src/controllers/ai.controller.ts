import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { prisma } from "../config/prisma";
import fs from "fs";
const pdfParse = require("pdf-parse");
import ffmpeg from "fluent-ffmpeg";
import whisper from "openai-whisper";

let lastFileText = "";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const TEXT_MODEL = "phi3";
const VISION_MODEL = "llava";

//Text chunking to fit model context
const chunkText = (text: string, size = 3500) => {
const chunks = [];
for (let i = 0; i < text.length; i += size) {
chunks.push(text.slice(i, i + size));
}
return chunks;
};

//Chat with AI main function
export const chatWithAI = async (req: AuthRequest, res: Response) => {
try {
if (!req.user) return res.status(401).json({ message: "Unauthorized" });

const message = req.body.message || "";
const msg = message.toLowerCase().trim();

//Debug logs
console.log("📩 USER MESSAGE:", msg);

let fileAction: "summary" | "deep" | "keypoints" | null = null;

//Simple command handling for file actions
if (msg.includes("summarize")) fileAction = "summary";
else if (msg.includes("deep")) fileAction = "deep";
else if (msg.includes("key")) fileAction = "keypoints";

console.log("🔥 FINAL ACTION DETECTED:", fileAction);
console.log("🔥 DETECTED ACTION:", fileAction);
console.log("🧠 FILE ACTION:", fileAction);
let fileText = "";
const file: any = req.file;

//File processing
if (file) {
console.log("📂 File received:", file.originalname);
console.log("📄 mimetype:", file.mimetype);

//Pdf
if (file.mimetype === "application/pdf") {
const buffer = fs.readFileSync(file.path);
const data = await pdfParse(buffer);

const chunks = chunkText(data.text || "");
fileText = chunks.slice(0, 5).join("\n"); // more accurate
lastFileText = fileText;
console.log("📊 FILE TEXT LENGTH:", fileText.length);
}

//Image 
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

//Audio
else if (file.mimetype.startsWith("audio")) {
const result: any = await whisper.transcribe(file.path);
fileText = result.text;
lastFileText = fileText;
}

//Video
else if (file.mimetype.startsWith("video")) {
const audioPath = file.path + ".mp3";

await new Promise((resolve) => {
ffmpeg(file.path).output(audioPath).on("end", resolve).run();
});

const result: any = await whisper.transcribe(audioPath);
fileText = result.text;
lastFileText = fileText;
}
}

//Create project
if (msg.includes("create project")) {
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

//Delete project
if (msg.includes("delete project")) {
const title = message.replace(/delete project/i, "").trim();
if (!title) return res.json({ reply: "Tell project name to delete." });

const deleted = await prisma.project.deleteMany({
where: { title: { contains: title, mode: "insensitive" } },
});

if (deleted.count === 0)
return res.json({ reply: "Project not found." });

return res.json({ reply: `🗑 Project "${title}" deleted.` });
}

//Delete user
if (msg.includes("delete user")) {
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

//Analytics
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

//Show projects 
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

//Show users
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

//Prompt construction with context
const projects = await prisma.project.findMany({
select: { title: true, description: true },
take: 10,
});

let context = "PROJECT DATABASE:\n";
projects.forEach((p, i) => {
context += `${i + 1}. ${p.title} - ${p.description}\n`;
});

//User context
const users = await prisma.user.findMany({
select: { username: true, role: true },
take: 10,
});

let usersContext = "USERS DATABASE:\n";
users.forEach((u, i) => {
usersContext += `${i + 1}. ${u.username} (${u.role})\n`;
});

//User role context
if ((!fileText || fileText.length < 20) && lastFileText) {
fileText = lastFileText;
console.log("♻️ Using last uploaded file memory");
}

//Final prompt construction
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
let taskInstruction = "";

if (fileAction === "summary") {
taskInstruction = "Give a clear short summary of this file.";
} 
else if (fileAction === "deep") {
taskInstruction = `
Explain deeply like expert.
- full detailed explanation
- important concepts
- hidden insights
- final conclusion`;
} 
else if (fileAction === "keypoints") {
taskInstruction = `
Extract only key points:
- main ideas
- important facts
- short bullets`;
} 
else {
taskInstruction = "Analyze this file and explain clearly.";
}

finalPrompt += `
FILE CONTENT:
${fileText}

TASK:
${taskInstruction}
`;
}

if (message) {
finalPrompt += `
USER QUESTION:
${message}
`;
}

//Test logs for final prompt 
const ollamaResponse = await fetch(OLLAMA_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: TEXT_MODEL,
prompt: finalPrompt,
stream: false,
keep_alive: 0,
options: {
options: {
temperature: 0.2,
num_predict: 200,   
num_ctx: 1024,      
}
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

//Welcome message with basic instructions
export const getWelcomeMessage = async (req: AuthRequest, res: Response) => {
try {
if (!req.user) return res.status(401).json({ message: "Unauthorized" });

const username = req.user?.username || "User";

return res.json({
reply: `Welcome ${username} 👋
Upload PDF, image, audio or video and ask anything.`,
});
} catch {
return res.status(500).json({ message: "Failed" });
}
};

