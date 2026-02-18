import Navbar from "@/components/Navbar";

export default function StudentLayout({ children }) {
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
