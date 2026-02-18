"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";

export default function AdminLoginPage() {
  const { adminLogin, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, redirect immediately
  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const loggedInUser = await adminLogin(email, password);
      if (loggedInUser) {
        router.push("/admin");
      }
    } catch {
      // Toast handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)",
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: "100%", padding: 36 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <HiOutlineShieldCheck size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>
            Admin Portal
          </h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: 14, marginTop: 4 }}>
            Restricted to administrators only
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div className="input-group">
            <label>Admin Email</label>
            <input
              type="email"
              className="input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                className="input"
                style={{ width: "100%", paddingRight: 40 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--foreground-muted)",
                  cursor: "pointer",
                }}
              >
                {showPass ? (
                  <HiOutlineEyeSlash size={18} />
                ) : (
                  <HiOutlineEye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{
              marginTop: 8,
              width: "100%",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            }}
          >
            {submitting ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>

        {/* Footer link */}
        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 14,
            color: "var(--foreground-muted)",
          }}
        >
          Not an admin?{" "}
          <Link
            href="/login"
            style={{ color: "var(--foreground)", fontWeight: 500 }}
          >
            Student login
          </Link>
        </p>
      </div>
    </div>
  );
}
