import React, { useState } from "react";
import { MessageCircleMore, X, Send } from "lucide-react";
import { getStoredToken, getStoredUser, normalizeRole } from "../utils/auth";
import { API_BASE_URL } from "../api/apiConfig";

function getRoleAwareQuickQuestions(role) {
  if (role === "student") {
    return [
      "How do I book an event?",
      "How do I reset my password?",
      "Where is my ticket?",
      "Why can't I register for this event?",
      "How do I cancel my booking?",
    ];
  }

  if (role === "vendor") {
    return [
      "How do I apply to an event?",
      "Where can I see my applications?",
      "Why was my vendor request rejected?",
      "How do I update my profile?",
      "How do I reset my password?",
    ];
  }

  if (role === "event_planner") {
    return [
      "How do I create an event?",
      "Why is my event pending?",
      "How do I review vendor applications?",
      "How do I edit my event?",
      "How do I reset my password?",
    ];
  }

  if (role === "admin") {
    return [
      "How do I review pending events?",
      "How do I approve or deny an event?",
      "How do I check platform stats?",
      "How do I reset my password?",
      "How does chatbot logging work?",
    ];
  }

  return [
    "How do I book an event?",
    "How do I reset my password?",
    "Where is my ticket?",
    "How do vendors apply?",
    "Why is my event pending?",
  ];
}

function getRoleAwareWelcome(role) {
  if (role === "student") {
    return "Hi, I am here to help with student tasks like events, bookings, tickets, and account help.";
  }

  if (role === "vendor") {
    return "Hi, I am here to help with vendor applications, profile updates, and account help.";
  }

  if (role === "event_planner") {
    return "Hi, I am here to help with creating events, approval flow, and vendor application review.";
  }

  if (role === "admin") {
    return "Hi, I am here to help with moderation, approvals, and admin operations.";
  }

  return "Hi, I am here to help with bookings, tickets, login, events, or vendor applications.";
}

export default function AskAI() {
  const currentRole = normalizeRole(getStoredUser()?.role);
  const quickQuestions = getRoleAwareQuickQuestions(currentRole);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: getRoleAwareWelcome(currentRole),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (presetQuestion) => {
    const messageText = String(presetQuestion || input).trim();
    if (!messageText) return;

    const userMessage = { role: "user", text: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/chatbot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: userMessage.text,
          history: messages.slice(-8),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sorry, I couldn't get a response.");
      }

      const reply = data.data?.answer || "Sorry, I couldn't get a response.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err.message || "Something went wrong. Please try again.",
        },
      ]);
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
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[22rem] max-w-[calc(100vw-3rem)] bg-white border border-blue-100 rounded-2xl shadow-2xl shadow-blue-500/20 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white">
            <span className="font-semibold text-sm">Ask AI</span>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="hover:opacity-70 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-80">
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

            {!loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-left text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    disabled={loading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="text-sm px-3 py-2 rounded-xl bg-gray-100 text-gray-400 max-w-[85%]">
                Typing...
              </div>
            )}
          </div>

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
              type="button"
              onClick={() => sendMessage()}
              disabled={loading}
              className="text-blue-500 hover:text-blue-600 cursor-pointer disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

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
