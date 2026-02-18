"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { notificationAPI } from "@/lib/api";
import { HiOutlineBell, HiOutlineCheck } from "react-icons/hi2";

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.get();
      setNotifications(data.notifications);
    } catch { }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch { }
  };

  const typeColors = {
    info: "var(--info)",
    success: "var(--success)",
    warning: "var(--warning)",
    course: "var(--info)",
    payment: "var(--success)",
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <div className="container">
          <div className="skeleton" style={{ height: 30, width: "40%", marginBottom: 24 }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px 80px" }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>Notifications</h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: 15, marginTop: 4, marginBottom: 32 }}>
          Stay updated with your learning journey
        </p>

        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
            <HiOutlineBell size={48} style={{ color: "var(--foreground-muted)", margin: "0 auto 16px" }} />
            <p style={{ color: "var(--foreground-muted)" }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                className="card"
                style={{
                  padding: "16px 20px",
                  opacity: n.isRead ? 0.6 : 1,
                  borderLeft: `3px solid ${typeColors[n.type] || "var(--border)"}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "opacity var(--transition-fast)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{n.title}</h4>
                  <p style={{ fontSize: 13, color: "var(--foreground-secondary)" }}>{n.message}</p>
                  <span style={{ fontSize: 11, color: "var(--foreground-muted)", marginTop: 4, display: "block" }}>
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n._id)} className="btn btn-ghost btn-icon" title="Mark as read">
                    <HiOutlineCheck size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
