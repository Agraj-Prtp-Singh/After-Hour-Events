import React, { useState } from "react";
import { MessageCircleMore, X, Send } from "lucide-react";

export default function AskAI() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! How can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a helpful assistant. Help users with anything they need.",
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Popup */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[22rem] max-w-[calc(100vw-3rem)] bg-white border border-blue-100 rounded-2xl shadow-2xl shadow-blue-500/20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white">
            <span className="font-semibold text-sm">Ask AI</span>
            <button onClick={() => setChatOpen(false)} className="hover:opacity-70 cursor-pointer">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-xl max-w-[85%] ${
                  msg.role === "assistant"
                    ? "bg-gray-100 text-gray-800 self-start"
                    : "bg-blue-500 text-white self-end ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="text-sm px-3 py-2 rounded-xl bg-gray-100 text-gray-400 max-w-[85%]">
                Typing...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="text-blue-500 hover:text-blue-600 cursor-pointer disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 border border-blue-500 shadow-lg shadow-blue-500/30 rounded-full px-5 py-3 text-base font-semibold text-white hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/40 transition-all cursor-pointer"
      >
        <MessageCircleMore size={20} className="text-white" />
        Ask AI
      </button>
    </>
  );
}
