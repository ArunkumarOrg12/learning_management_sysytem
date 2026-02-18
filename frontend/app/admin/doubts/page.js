"use client";

import { useState, useEffect } from "react";
import { chatAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { IoSend } from "react-icons/io5";

export default function AdminDoubtsPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [reply, setReply] = useState("");

  useEffect(() => { fetchChats(); }, [filter]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await chatAPI.getAll(params);
      setChats(data.chats);
    } catch { } finally { setLoading(false); }
  };

  const handleReply = async (chatId) => {
    if (!reply.trim()) return;
    try {
      await chatAPI.reply(chatId, { message: reply });
      setReply("");
      toast.success("Reply sent");
      fetchChats();
    } catch { toast.error("Failed"); }
  };

  const handleResolve = async (chatId) => {
    try {
      await chatAPI.resolve(chatId);
      toast.success("Marked as resolved");
      fetchChats();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24 }}>
        Manage Doubts
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["", "open", "resolved"].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(s)}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : chats.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <p style={{ color: "var(--foreground-muted)" }}>No doubt threads found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {chats.map((chat) => (
            <div key={chat._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{chat.subject}</h3>
                  <div style={{ fontSize: 12, color: "var(--foreground-muted)", marginTop: 2 }}>
                    {chat.userId?.name} ({chat.userId?.email}) · {chat.courseId?.title}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`badge ${chat.status === "resolved" ? "badge-success" : "badge-warning"}`}>
                    {chat.status}
                  </span>
                  {chat.status === "open" && (
                    <button className="btn btn-sm btn-secondary" onClick={() => handleResolve(chat._id)}>
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 6,
                maxHeight: activeChat === chat._id ? 300 : 100, overflow: "auto",
                transition: "max-height var(--transition-normal)",
              }}>
                {chat.messages?.map((msg, i) => (
                  <div key={i} style={{
                    padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 13,
                    background: msg.senderRole === "admin" ? "var(--info-bg)" : "var(--accent)",
                  }}>
                    <span style={{ fontWeight: 500, fontSize: 11, color: msg.senderRole === "admin" ? "var(--info)" : "var(--foreground-muted)" }}>
                      {msg.sender?.name || msg.senderRole} · {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    <p style={{ marginTop: 2 }}>{msg.text}</p>
                  </div>
                ))}
              </div>

              {chat.messages?.length > 2 && (
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}
                  onClick={() => setActiveChat(activeChat === chat._id ? null : chat._id)}>
                  {activeChat === chat._id ? "Show less" : `Show all ${chat.messages.length} messages`}
                </button>
              )}

              {/* Reply */}
              {chat.status === "open" && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input className="input" style={{ flex: 1 }} placeholder="Type your reply..."
                    value={activeChat === chat._id ? reply : ""}
                    onFocus={() => setActiveChat(chat._id)}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReply(chat._id)}
                  />
                  <button className="btn btn-primary btn-icon" onClick={() => handleReply(chat._id)}>
                    <IoSend size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
