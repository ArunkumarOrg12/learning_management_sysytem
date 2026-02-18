"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import {
  HiOutlineUsers, HiOutlineBookOpen, HiOutlineCreditCard,
  HiOutlineChatBubbleLeftRight, HiOutlineBanknotes,
} from "react-icons/hi2";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data.stats);
      setRecent(data.recentPayments);
    } catch { }
    finally { setLoading(false); }
  };

  const statCards = stats ? [
    { label: "Total Students", value: stats.totalStudents, icon: HiOutlineUsers, color: "var(--info)" },
    { label: "Total Courses", value: stats.totalCourses, icon: HiOutlineBookOpen, color: "var(--success)" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue?.toLocaleString()}`, icon: HiOutlineBanknotes, color: "var(--warning)" },
    { label: "Payments", value: stats.totalPayments, icon: HiOutlineCreditCard, color: "#a855f7" },
    { label: "Open Doubts", value: stats.openDoubts, icon: HiOutlineChatBubbleLeftRight, color: "var(--error)" },
  ] : [];

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 30, width: "40%", marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 32 }}>Dashboard</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "var(--radius-md)",
                background: `${s.color}15`, display: "flex",
                alignItems: "center", justifyContent: "center",
                color: s.color,
              }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "var(--foreground-muted)" }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Payments */}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Recent Transactions</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--foreground-muted)" }}>
                  No recent transactions
                </td>
              </tr>
            ) : (
              recent.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "var(--radius-full)",
                        background: "var(--accent)", display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600,
                      }}>
                        {p.userId?.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{p.userId?.name}</div>
                        <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>{p.userId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.courseId?.title || "Subscription"}</td>
                  <td style={{ fontWeight: 600 }}>₹{p.amount}</td>
                  <td style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${p.status === "paid" ? "badge-success" : "badge-warning"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
