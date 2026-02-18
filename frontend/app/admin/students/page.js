"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { HiOutlineTrash, HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => { fetchStudents(); }, [search, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getStudents({ search, page, limit: 20 });
      setStudents(data.students);
      setPagination(data.pagination);
    } catch { } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await adminAPI.deleteStudent(id);
      toast.success("Student deleted");
      fetchStudents();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24 }}>Manage Students</h1>

      <div style={{ position: "relative", maxWidth: 400, marginBottom: 24 }}>
        <HiOutlineMagnifyingGlass size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }} />
        <input className="input" style={{ width: "100%", paddingLeft: 40 }} placeholder="Search by name or email..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Enrolled Courses</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "var(--radius-full)",
                        background: "var(--accent)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 600,
                      }}>
                        {s.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "var(--foreground-muted)" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.enrolledCourses?.length || 0}</td>
                  <td>
                    <span className={`badge ${s.subscription?.plan === "pro" ? "badge-success" : s.subscription?.plan === "enterprise" ? "badge-info" : "badge-warning"}`}>
                      {s.subscription?.plan || "free"}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--foreground-muted)" }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(s._id)}>
                      <HiOutlineTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
