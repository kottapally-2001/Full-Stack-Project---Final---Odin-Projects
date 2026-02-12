import { useState, useEffect } from "react";

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  /* ===== LOAD WELCOME MESSAGE ===== */

  useEffect(() => {
    const fetchWelcome = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:4000/ai/welcome", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setMessages([{ role: "ai", text: data.reply }]);
      } catch {
        setMessages([
          {
            role: "ai",
            text: "Hi 👋 Welcome! Ask me about your projects.",
          },
        ]);
      }
    };

    if (isOpen && messages.length === 0) {
      fetchWelcome();
    }
  }, [isOpen]);

  /* ===== SEND MESSAGE ===== */

  const sendMessage = async () => {
    if (!message.trim()) return;

    const token = localStorage.getItem("token");
    const userMessage = message;

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ AI service unavailable. Try again.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <div className="ai-float-btn" onClick={() => setIsOpen(!isOpen)}>
        🤖
      </div>

      {isOpen && (
        <div className="ai-float-container">
          <div className="ai-header">
            AI Assistant 🤖
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="ai-chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role}`}>
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="ai-message ai">Typing...📃</div>
            )}
          </div>

          <div className="ai-input-container">
            <input
              className="ai-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              className="ai-button"
              onClick={sendMessage}
              disabled={loading}
            >
              Send ▶
            </button>
          </div>
        </div>
      )}
    </>
  );
}
