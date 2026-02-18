"use client";

import { useState, useEffect } from "react";
import { notificationAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "", message: "", type: "info", targetAll: true,
  });

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.notifications);
    } catch { } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await notificationAPI.create(form);
      toast.success("Notification sent!");
      setShowModal(false);
      setForm({ title: "", message: "", type: "info", targetAll: true });
      fetchNotifications();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await notificationAPI.delete(id);
      toast.success("Deleted");
      fetchNotifications();
    } catch { toast.error("Failed"); }
  };

  const typeColors = {
    info: "badge-info",
    success: "badge-success",
    warning: "badge-warning",
    course: "badge-info",
    payment: "badge-success",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>Notifications</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus size={18} /> Send Notification
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
                <th>Target</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--foreground-muted)" }}>
                    No notifications sent yet
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n._id}>
                    <td style={{ fontWeight: 500, fontSize: 14 }}>{n.title}</td>
                    <td style={{ fontSize: 13, color: "var(--foreground-secondary)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.message}
                    </td>
                    <td><span className={`badge ${typeColors[n.type]}`}>{n.type}</span></td>
                    <td style={{ fontSize: 13 }}>{n.targetAll ? "All users" : `${n.targetUsers?.length} users`}</td>
                    <td style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(n._id)}>
                        <HiOutlineTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Send Notification</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><IoClose size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label>Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Message</label>
                <textarea className="input" rows={3} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ resize: "vertical" }} />
              </div>
              <div className="input-group">
                <label>Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="course">Course</option>
                  <option value="payment">Payment</option>
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={form.targetAll} onChange={(e) => setForm({ ...form, targetAll: e.target.checked })} />
                Send to all users
              </label>
              <button className="btn btn-primary btn-lg" onClick={handleCreate} style={{ marginTop: 8 }}>
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
