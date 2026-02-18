"use client";

import { useState, useEffect } from "react";
import { paymentAPI } from "@/lib/api";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchPayments(); }, [filter, page]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter) params.status = filter;
      const { data } = await paymentAPI.getAll(params);
      setPayments(data.payments);
      setPagination(data.pagination);
    } catch { } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 24 }}>
        Payments & Transactions
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["", "paid", "created", "failed"].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-secondary"}`}
            onClick={() => { setFilter(s); setPage(1); }}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Type</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Razorpay ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--foreground-muted)" }}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.userId?.name}</div>
                      <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>{p.userId?.email}</div>
                    </td>
                    <td><span className="badge badge-info">{p.type}</span></td>
                    <td style={{ fontSize: 13 }}>{p.courseId?.title || "—"}</td>
                    <td style={{ fontWeight: 600 }}>₹{p.amount}</td>
                    <td style={{ fontSize: 12, color: "var(--foreground-muted)", fontFamily: "monospace" }}>
                      {p.razorpayPaymentId || "—"}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${p.status === "paid" ? "badge-success" : p.status === "failed" ? "badge-error" : "badge-warning"}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
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
