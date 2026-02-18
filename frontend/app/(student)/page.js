"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { courseAPI, progressAPI } from "@/lib/api";
import { HiOutlinePlay, HiOutlineStar, HiOutlineUsers, HiOutlineAcademicCap } from "react-icons/hi2";
import { IoArrowForward } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let gsapInstance;
    const initGSAP = async () => {
      try {
        const gsapModule = await import("gsap");
        gsapInstance = gsapModule.gsap;

        gsapInstance.fromTo(heroRef.current?.querySelector(".hero-title"),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        );
        gsapInstance.fromTo(heroRef.current?.querySelector(".hero-subtitle"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" }
        );
        gsapInstance.fromTo(heroRef.current?.querySelector(".hero-actions"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: "power3.out" }
        );

        gsapInstance.fromTo(".stat-card",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.6, ease: "power2.out" }
        );

        gsapInstance.fromTo(".course-card",
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, delay: 0.8, ease: "power2.out" }
        );
      } catch (e) {
        console.log("GSAP init skipped");
      }
    };
    initGSAP();
  }, [loading]);

  const fetchData = async () => {
    try {
      const [trendRes, progRes] = await Promise.allSettled([
        courseAPI.getTrending(),
        user ? progressAPI.getAll() : Promise.resolve({ data: { progress: [] } }),
      ]);
      setTrending(trendRes.status === "fulfilled" ? trendRes.value.data.courses : []);
      setProgress(progRes.status === "fulfilled" ? progRes.value.data.progress : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: HiOutlineAcademicCap, label: "Active Courses", value: "120+" },
    { icon: HiOutlineUsers, label: "Students", value: "8,500+" },
    { icon: HiOutlinePlay, label: "Video Hours", value: "2,000+" },
    { icon: HiOutlineStar, label: "Avg Rating", value: "4.8" },
  ];

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} style={{
        padding: "80px 24px",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 60%)",
        borderBottom: "1px solid var(--border-light)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-title" style={{ opacity: 0 }}>
            <span style={{
              display: "inline-block", padding: "6px 14px", fontSize: 12, fontWeight: 500,
              color: "var(--foreground-secondary)", background: "var(--accent)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-full)",
              marginBottom: 24, letterSpacing: "0.05em", textTransform: "uppercase",
            }}>
              The Future of Online Learning
            </span>
            <h1 style={{
              fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800,
              lineHeight: 1.05, letterSpacing: "-0.04em",
              maxWidth: 800, margin: "0 auto",
            }}>
              <span className="text-gradient">Master Skills.</span>
              <br />
              Build Your Future.
            </h1>
          </div>

          <p className="hero-subtitle" style={{
            opacity: 0, fontSize: 18, color: "var(--foreground-secondary)",
            maxWidth: 560, margin: "20px auto 0", lineHeight: 1.6,
          }}>
            Premium courses, interactive video lessons, and real-time mentorship.
            Learn at your pace with industry experts.
          </p>

          <div className="hero-actions" style={{
            opacity: 0, display: "flex", gap: 12,
            justifyContent: "center", marginTop: 36,
          }}>
            <Link href="/courses" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
              Explore Courses <IoArrowForward />
            </Link>
            {!user && (
              <Link href="/register" className="btn btn-secondary btn-lg">
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "48px 24px", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card card" style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "20px 24px", opacity: 0,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "var(--radius-md)",
                    background: "var(--accent)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "var(--foreground)",
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--foreground-muted)" }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Courses */}
      <section style={{ padding: "64px 24px" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>
                Trending Courses
              </h2>
              <p style={{ color: "var(--foreground-muted)", fontSize: 14, marginTop: 4 }}>
                Most popular courses this week
              </p>
            </div>
            <Link href="/courses" className="btn btn-secondary btn-sm">
              View All <IoArrowForward size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
                  <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="skeleton" style={{ height: 20, width: "80%" }} />
                    <div className="skeleton" style={{ height: 14, width: "60%" }} />
                    <div className="skeleton" style={{ height: 14, width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {trending.map((course) => (
                <Link key={course._id} href={`/courses/${course._id}`} className="course-card card card-interactive" style={{
                  padding: 0, overflow: "hidden", opacity: 0, textDecoration: "none",
                }}>
                  <div style={{
                    height: 160, background: `linear-gradient(135deg, #1a1a2e, #16213e)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 48, opacity: 0.5,
                  }}>
                    📚
                  </div>
                  <div style={{ padding: 20 }}>
                    <span className="badge badge-info" style={{ marginBottom: 8 }}>{course.category}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 8, letterSpacing: "-0.01em" }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {course.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#ffc107", fontSize: 13 }}>
                        <HiOutlineStar size={14} /> {course.averageRating || "New"}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--foreground-muted)" }}>
                        {course.enrolledCount || 0} students
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {course.price > 0 ? `₹${course.price}` : "Free"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Progress Section */}
      {user && progress.length > 0 && (
        <section style={{ padding: "48px 24px 80px", borderTop: "1px solid var(--border-light)" }}>
          <div className="container">
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.02em" }}>
              Continue Learning
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {progress.map((p) => (
                <Link key={p._id} href={`/courses/${p.courseId?._id}`} className="card card-interactive" style={{ textDecoration: "none" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600 }}>{p.courseId?.title}</h4>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)", marginBottom: 6 }}>
                      <span>Progress</span>
                      <span>{p.completionPercentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${p.completionPercentage}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
