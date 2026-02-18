"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { certificateAPI } from "@/lib/api";
import { HiOutlineAcademicCap, HiOutlineDocumentText } from "react-icons/hi2";

export default function CertificatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchCerts();
  }, [user]);

  const fetchCerts = async () => {
    try {
      const { data } = await certificateAPI.getMy();
      setCerts(data.certificates);
    } catch { }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <div className="container">
          <div className="skeleton" style={{ height: 30, width: "40%", marginBottom: 32 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 180 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px 80px" }}>
      <div className="container">
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>My Certificates</h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: 15, marginTop: 4 }}>
          Achievements earned through course completion
        </p>

        {certs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 24px", marginTop: 32 }}>
            <HiOutlineDocumentText size={48} style={{ color: "var(--foreground-muted)", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Certificates Yet</h3>
            <p style={{ color: "var(--foreground-muted)", fontSize: 14 }}>
              Complete a course to earn your first certificate!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20, marginTop: 32 }}>
            {certs.map((cert) => (
              <div key={cert._id} className="card" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                border: "1px solid var(--foreground-muted)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, right: 0, width: 80, height: 80,
                  background: "radial-gradient(circle at top right, rgba(255,215,0,0.1), transparent)",
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #ffd700, #ff8c00)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <HiOutlineAcademicCap size={22} color="#000" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{cert.courseName}</h3>
                    <p style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
                      {cert.studentName}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                  <span className="badge badge-success">{cert.certificateId}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
