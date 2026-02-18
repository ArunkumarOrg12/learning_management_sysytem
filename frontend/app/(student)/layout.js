"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

// Pages inside (student) group that don't require authentication
const PUBLIC_PATHS = ["/login", "/register"];

export default function StudentLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading || isPublicPage) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role === "admin") {
      router.replace("/admin");
    }
  }, [user, loading, router, isPublicPage]);

  // Public pages (login/register) — render without any auth guard or navbar
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Show nothing while auth is resolving or redirecting
  if (loading || !user || user.role === "admin") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 64px)" }}>{children}</main>
      <footer
        style={{
          borderTop: "1px solid var(--border-light)",
          padding: "32px 24px",
          textAlign: "center",
          fontSize: "13px",
          color: "var(--foreground-muted)",
        }}
      >
        © 2026 LearnHub. Built for the future of learning.
      </footer>
    </>
  );
}
