import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<
    "normal" | "create" | "delete" | "adduser" | "deleteuser"
  >("normal");

  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // NAVIGATION 
  const handleAIResponse = (text: string) => {
    if (!text) return;
    if (text.includes("go_projects")) navigate("/projects");
    if (text.includes("go_users")) navigate("/users");
    if (text.includes("go_dashboard")) navigate("/dashboard");
    if (text.includes("go_add_project")) navigate("/projects/new");
  };
  // WELCOME 
  useEffect(() => {
    const fetchWelcome = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:4000/ai/welcome", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setMessages([
          { role: "ai", text: data.reply },
          {
            role: "ai",
            text:
              "Choose an option:\n\n1️⃣ Create Project\n2️⃣ Delete Project\n3️⃣ Show Stats\n4️⃣ Show Projects\n5️⃣ Show Users\n6️⃣ Add User\n7️⃣ Delete User",
          },
        ]);
      } catch {
        setMessages([{ role: "ai", text: "Hi 👋 Welcome! Ask me anything." }]);
      }
    };

    if (isOpen && messages.length === 0) fetchWelcome();
  }, [isOpen]);

  // SEND MESSAGE
  const sendMessage = async (customMsg?: string) => {
    let finalMessage = customMsg || message;
    if (!finalMessage.trim() && !file) return;

    const trimmed = finalMessage.trim();

    if (trimmed === "1") return handleOptionClick(1);
    if (trimmed === "2") return handleOptionClick(2);
    if (trimmed === "3") return handleOptionClick(3);
    if (trimmed === "4") return handleOptionClick(4);
    if (trimmed === "5") return handleOptionClick(5);
    if (trimmed === "6") return handleOptionClick(6);
    if (trimmed === "7") return handleOptionClick(7);

    const token = localStorage.getItem("token");

    if (mode === "create") {
      finalMessage = `create project ${finalMessage}`;
      setMode("normal");
    }
    if (mode === "delete") {
      finalMessage = `delete project ${finalMessage}`;
      setMode("normal");
    }
    if (mode === "adduser") {
      finalMessage = `create user ${finalMessage}`;
      setMode("normal");
    }
    if (mode === "deleteuser") {
      finalMessage = `delete user ${finalMessage}`;
      setMode("normal");
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", text: finalMessage || "📎 File uploaded" },
    ]);

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", finalMessage || "");
      if (file) formData.append("file", file);

      const res = await fetch("http://localhost:4000/ai/chat", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      const replyText =
        data?.reply ||
        data?.message ||
        "⚠️ AI server error. Check backend logs.";

      setMessages((prev) => [...prev, { role: "ai", text: replyText }]);
      handleAIResponse(replyText);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ AI service unavailable" },
      ]);
    }

  
    setFile(null);
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }

    setLoading(false);
  };

  // BUTTON ACTIONS 
  const handleOptionClick = (option: number) => {
    switch (option) {
      case 1: startCreate(); break;
      case 2: startDelete(); break;
      case 3: showAnalytics(); break;
      case 4: showProjects(); break;
      case 5: showUsers(); break;
      case 6: startAddUser(); break;
      case 7: startDeleteUser(); break;
    }
  };

  const showAnalytics = () => {
    navigate("/dashboard");
    sendMessage("show analytics");
  };

  const startCreate = () => {
    navigate("/projects/new");
    setMode("create");
    setMessages((p) => [...p, { role: "ai", text: "Tell me project name 👇" }]);
  };

  const startDelete = () => {
    navigate("/projects");
    setMode("delete");
    setMessages((p) => [...p, { role: "ai", text: "Tell project name 🗑️" }]);
  };

  const startAddUser = () => {
    navigate("/users");
    setMode("adduser");
    setMessages((p) => [...p, { role: "ai", text: "Enter user + role 👤" }]);
  };

  const startDeleteUser = () => {
    navigate("/users");
    setMode("deleteuser");
    setMessages((p) => [...p, { role: "ai", text: "Username to delete 👤" }]);
  };

  const showProjects = () => {
    navigate("/projects");
    sendMessage("show projects");
  };

  const showUsers = () => {
    navigate("/users");
    sendMessage("show users");
  };

  const goDashboard = () => navigate("/dashboard");

  // UI
  return (
    <>
      <div className="ai-float-btn" onClick={() => setIsOpen(!isOpen)}>🤖</div>

      {isOpen && (
        <div className="ai-float-container">
          <div className="ai-header">
            AI Assistant 🤖
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="ai-actions">
            <button className="ai-action-btn" onClick={goDashboard}>🏠 Dashboard</button>
            <button className="ai-action-btn" onClick={showAnalytics}>📊 Stats</button>
            <button className="ai-action-btn" onClick={showProjects}>📁 Projects</button>
            <button className="ai-action-btn" onClick={startCreate}>➕ Create</button>
            <button className="ai-action-btn" onClick={startDelete}>🗑 Delete</button>
            <button className="ai-action-btn" onClick={showUsers}>👥 Users</button>
          </div>

          <div className="ai-chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role}`}>
                {(msg.text || "").split("\n").map((line, i) => {
                  const optionMatch = line.match(/^(\d)/);
                  if (optionMatch && msg.role === "ai") {
                    const num = parseInt(optionMatch[1]);
                    return (
                      <div key={i} onClick={() => handleOptionClick(num)} className="ai-option">
                        {line}
                      </div>
                    );
                  }
                  return <div key={i}>{line}</div>;
                })}
              </div>
            ))}
            {loading && <div className="ai-message ai">Typing...⚡</div>}
            <div ref={chatEndRef}></div>
          </div>

          <div className="ai-input-container">

            <label className="ai-upload-btn" title="Upload">
              📎
              <input
                ref={fileInputRef}
                type="file"
                className="ai-file-input"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  setFile(selected);
                }}
              />
            </label>

            {file && (
              <div className="ai-file-badge">
                {file.name}
                <span onClick={() => setFile(null)}>✕</span>
              </div>
            )}

            <input
              className="ai-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask AI..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              className="ai-button"
              onClick={() => sendMessage()}
              disabled={loading}
            >
              ▶
            </button>

          </div>
        </div>
      )}
    </>
  );
}
