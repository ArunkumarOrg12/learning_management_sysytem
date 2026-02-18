"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  HiOutlineAcademicCap,
  HiOutlineSquares2X2,
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBell,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import styles from "./AdminLayout.module.css";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { href: "/admin/courses", label: "Courses", icon: HiOutlineBookOpen },
  { href: "/admin/students", label: "Students", icon: HiOutlineUsers },
  { href: "/admin/payments", label: "Payments", icon: HiOutlineCreditCard },
  { href: "/admin/doubts", label: "Doubts", icon: HiOutlineChatBubbleLeftRight },
  { href: "/admin/notifications", label: "Notifications", icon: HiOutlineBell },
];

export default function AdminLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  // The /admin/login page lives inside the admin folder but must render freely
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--background)" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, background: "var(--background)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Access Denied</h2>
        <p style={{ color: "var(--foreground-muted)" }}>You must be an admin to access this area.</p>
        <Link href="/admin/login" className="btn btn-primary">Admin Sign In</Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.logo}>
          <HiOutlineAcademicCap size={24} />
          <span>LearnHub</span>
        </Link>

        <nav className={styles.nav}>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navItem} ${pathname === link.href ? styles.active : ""}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user.name?.charAt(0)}</div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <HiOutlineArrowRightOnRectangle size={18} />
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
