import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function AiChat({
  onClose,
  messages,
  setMessages,
  autoMinimize
}: any) {

  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<
    "normal" | "create" | "delete" | "adduser" | "deleteuser"
  >("normal");

  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fileMode, setFileMode] = useState(false);

  /* scroll */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* welcome once */
  useEffect(() => {
    if ((messages || []).length !== 0) return;

    const fetchWelcome = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:4000/ai/welcome", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        setMessages([
          { role: "ai", text: data?.reply || "Hi 👋" },
          {
            role: "ai",
            text:
              "Choose an option:\n\n1️⃣ Create Project\n2️⃣ Delete Project\n3️⃣ Show Stats\n4️⃣ Show Projects\n5️⃣ Show Users\n6️⃣ Add User\n7️⃣ Delete User",
          },
        ]);
      } catch {
        setMessages([{ role: "ai", text: "Hi 👋 Welcome!" }]);
      }
    };

    fetchWelcome();
  }, []);

  /* navigation triggers */
  const handleAIResponse = (text: string) => {
    if (!text) return;

    if (text.includes("go_projects")) navigate("/projects");
    if (text.includes("go_users")) navigate("/users");
    if (text.includes("go_dashboard")) navigate("/dashboard");
    if (text.includes("go_add_project")) navigate("/projects/new");
  };

  /* send message */
  const sendMessage = async (customMsg?: string) => {
    let finalMessage = customMsg ?? message ?? "";
    if (!finalMessage.trim() && !file) return;

    const trimmed = finalMessage.trim();

    /* file mode */
    if (fileMode) {
      if (trimmed.toLowerCase() === "a") finalMessage = "summarize file";
      else if (trimmed.toLowerCase() === "b") finalMessage = "deep explain file";
      else if (trimmed.toLowerCase() === "c") finalMessage = "key points file";
      else return;
    }

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

    setMessages((prev: any) => [
      ...(prev || []),
      { role: "user", text: finalMessage }
    ]);

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", finalMessage);
      if (file) formData.append("file", file);

      const res = await fetch("http://localhost:4000/ai/chat", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      const replyText = data?.reply || "AI error";

      setMessages((prev: any) => [
        ...(prev || []),
        { role: "ai", text: replyText }
      ]);

      handleAIResponse(replyText);
    } catch {
      setMessages((prev: any) => [
        ...(prev || []),
        { role: "ai", text: "⚠️ AI server error" }
      ]);
    }

    setMessage("");
    setLoading(false);
  };

  /* dashboard option click */
  const handleOptionClick = (option: number) => {
    switch (option) {
      case 1:
        navigate("/projects/new");
        autoMinimize();
        break;

      case 2:
        navigate("/projects");
        autoMinimize();
        break;

      case 3:
        navigate("/dashboard");
        sendMessage("show analytics");
        autoMinimize();
        break;

      case 4:
        navigate("/projects");
        sendMessage("show projects");
        autoMinimize();
        break;

      case 5:
        navigate("/users");
        sendMessage("show users");
        autoMinimize();
        break;

      case 6:
        navigate("/users");
        autoMinimize();
        break;

      case 7:
        navigate("/users");
        autoMinimize();
        break;
    }
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="ai-header">
          AI Assistant 🤖
          <button onClick={onClose}>✕</button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="ai-actions">

{/* DASHBOARD */}
<button
className="ai-action-btn"
onClick={()=>{
  setMessages((p:any)=>[...p,{role:"user",text:"Open dashboard"}]);
  navigate("/dashboard");
  autoMinimize();
}}>
🏠 Dashboard
</button>

{/* STATS */}
<button
className="ai-action-btn"
onClick={()=>{
  setMessages((p:any)=>[...p,{role:"user",text:"Show stats"}]);
  sendMessage("show analytics");
  navigate("/dashboard");
  autoMinimize();
}}>
📊 Stats
</button>

{/* PROJECTS */}
<button
className="ai-action-btn"
onClick={()=>{
  setMessages((p:any)=>[...p,{role:"user",text:"Show projects"}]);
  sendMessage("show projects");
  navigate("/projects");
  autoMinimize();
}}>
📁 Projects
</button>

{/* CREATE PROJECT */}
<button
className="ai-action-btn"
onClick={()=>{
  navigate("/projects/new");
  setMode("create");
  setMessages((p:any)=>[
    ...p,
    {role:"ai",text:"Enter project name to create 👇"}
  ]);
}}>
➕ Create Project
</button>

{/* DELETE PROJECT */}
<button
className="ai-action-btn"
onClick={()=>{
  navigate("/projects");
  setMode("delete");
  setMessages((p:any)=>[
    ...p,
    {role:"ai",text:"Enter project name to delete 🗑️"}
  ]);
}}>
🚫 Delete Project
</button>

{/* CREATE USER */}
<button
className="ai-action-btn"
onClick={()=>{
  navigate("/users");
  setMode("adduser");
  setMessages((p:any)=>[
    ...p,
    {role:"ai",text:"Enter username and role 👤"}
  ]);
}}
>
👤 Create User
</button>

{/* DELETE USER */}
<button
className="ai-action-btn"
onClick={()=>{
  navigate("/users");
  setMode("deleteuser");
  setMessages((p:any)=>[
    ...p,
    {role:"ai",text:"Enter username to delete ❌"}
  ]);
}}>
🚫 Delete User
</button>

{/* SHOW USERS */}
<button
className="ai-action-btn"
onClick={()=>{
  navigate("/users");
  sendMessage("show users");
  autoMinimize();
}}>
👥 Users
</button>

</div>

        {/* CHAT */}
        <div className="ai-chat-box">
          {(messages || []).map((msg: any, index: number) => (
            <div
              key={index}
              className={`ai-message ${msg?.role} ${
                msg?.role === "ai" && msg?.text?.includes("System Analytics")
                  ? "glass-analytics"
                  : ""
              }`}
            >
              {(msg?.text || "").split("\n").map((line: string, i: number) => {
                const match = (line || "").match(/^([a-cA-C]|\d+)/);

                if (match && msg?.role === "ai") {
                  const value = line.trim().charAt(0).toLowerCase();

                  if (["a", "b", "c"].includes(value)) {
                    return (
                      <button key={i} className="ai-glass-btn" onClick={()=>sendMessage(value)}>
                        {line}
                      </button>
                    );
                  }

                  const num = parseInt(value);
                  if (!isNaN(num)) {
                    return (
                      <button key={i} className="ai-glass-btn" onClick={()=>handleOptionClick(num)}>
                        {line}
                      </button>
                    );
                  }
                }

                return <div key={i}>{line}</div>;
              })}
            </div>
          ))}

          {loading && <div className="ai-message ai">Typing...⚡</div>}
          <div ref={chatEndRef}></div>
        </div>

        {/* INPUT */}
        <div className="ai-input-container">
          <input
            className="ai-input"
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            placeholder="Ask AI..."
            onKeyDown={(e)=>e.key==="Enter" && sendMessage()}
          />
          <button className="ai-button" onClick={()=>sendMessage()}>
            ▶
          </button>
        </div>

      </div>
    </div>
  );
}