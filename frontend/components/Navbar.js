"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { IoNotificationsOutline, IoMenuOutline, IoCloseOutline } from "react-icons/io5";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/subscription", label: "Pricing" },
    { href: "/certificates", label: "Certificates" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <HiOutlineAcademicCap size={28} />
          <span>LearnHub</span>
        </Link>

        <div className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link href="/notifications" className={styles.iconBtn}>
                <IoNotificationsOutline size={20} />
              </Link>
              <div className={styles.profileMenu}>
                <button className={styles.avatar}>
                  {user.name?.charAt(0).toUpperCase()}
                </button>
                <div className={styles.dropdown}>
                  <span className={styles.dropdownName}>{user.name}</span>
                  <span className={styles.dropdownEmail}>{user.email}</span>
                  <div className={styles.dropdownDivider} />
                  {user.role === "admin" && (
                    <Link href="/admin" className={styles.dropdownItem}>Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
          <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
