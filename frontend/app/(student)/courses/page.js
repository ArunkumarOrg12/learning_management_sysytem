"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { courseAPI } from "@/lib/api";
import { HiOutlineStar, HiOutlineMagnifyingGlass } from "react-icons/hi2";

const categories = ["All", "Web Development", "Mobile Development", "Data Science", "Machine Learning", "DevOps", "Design", "Business"];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCourses();
  }, [search, category, page]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await courseAPI.getAll({ search, category, page, limit: 12 });
      setCourses(data.courses);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 24px 80px" }}>
      <div className="container">
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>
          All Courses
        </h1>
        <p style={{ color: "var(--foreground-muted)", marginTop: 4, fontSize: 15 }}>
          Browse our complete course catalog
        </p>

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 300px" }}>
            <HiOutlineMagnifyingGlass
              size={18}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }}
            />
            <input
              className="input"
              style={{ width: "100%", paddingLeft: 40 }}
              placeholder="Search courses..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${category === cat ? "btn-primary" : "btn-secondary"}`}
                onClick={() => { setCategory(cat); setPage(1); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 32 }}>
          {loading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div className="skeleton" style={{ height: 160, borderRadius: 0 }} />
                  <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div className="skeleton" style={{ height: 20, width: "80%" }} />
                    <div className="skeleton" style={{ height: 14, width: "60%" }} />
                  </div>
                </div>
              ))
            : courses.map((course) => (
                <Link key={course._id} href={`/courses/${course._id}`} className="card card-interactive" style={{
                  padding: 0, overflow: "hidden", textDecoration: "none",
                }}>
                  <div style={{
                    height: 160,
                    background: course.thumbnail ? `url(${course.thumbnail}) center/cover` : "linear-gradient(135deg, #1a1a2e, #16213e)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: course.thumbnail ? 1 : 0.5,
                  }}>
                    {!course.thumbnail && "📚"}
                  </div>
                  <div style={{ padding: 20 }}>
                    <span className="badge badge-info" style={{ marginBottom: 8 }}>{course.category}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{course.title}</h3>
                    <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {course.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#ffc107", fontSize: 13 }}>
                        <HiOutlineStar size={14} /> {course.averageRating || "New"}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {course.price > 0 ? `₹${course.price}` : "Free"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
          }
        </div>

        {!loading && courses.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--foreground-muted)" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📭</p>
            <p style={{ fontSize: 16 }}>No courses found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
