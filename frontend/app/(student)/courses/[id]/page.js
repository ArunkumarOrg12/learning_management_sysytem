"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseAPI, progressAPI, ratingAPI, chatAPI } from "@/lib/api";
import toast from "react-hot-toast";
import {
  HiOutlinePlay, HiOutlineCheck, 
  HiOutlineChatBubbleLeftRight, HiOutlineChevronDown, HiOutlineChevronRight,
} from "react-icons/hi2";
import { IoSend } from "react-icons/io5";
import styles from "./CourseDetail.module.css";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("content");

  // Rating form
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");

  // Chat form
  const [chats, setChats] = useState([]);
  const [chatSubject, setChatSubject] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const { data } = await courseAPI.getOne(id);
      setCourse(data.course);
      setVideos(data.videos);

      // Open first module by default
      if (data.course.modules?.length > 0) {
        setOpenModules({ [data.course.modules[0]._id]: true });
      }

      // Set first video as active
      if (data.videos?.length > 0) {
        setActiveVideo(data.videos[0]);
      }

      // Fetch progress if authenticated
      if (user) {
        try {
          const progRes = await progressAPI.get(id);
          setProgress(progRes.data.progress);
          // Resume last watched
          if (progRes.data.progress?.lastWatchedVideo) {
            const lastVideo = data.videos.find(v => v._id === progRes.data.progress.lastWatchedVideo._id || v._id === progRes.data.progress.lastWatchedVideo);
            if (lastVideo) setActiveVideo(lastVideo);
          }
        } catch {}
      }

      // Fetch ratings
      try {
        const ratRes = await ratingAPI.getCourse(id);
        setRatings(ratRes.data.ratings);
      } catch {}

      // Fetch chats
      if (user) {
        try {
          const chatRes = await chatAPI.getCourse(id);
          setChats(chatRes.data.chats);
        } catch {}
      }
    } catch (e) {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    if (!url) return "";
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
    return match ? match[1] : url;
  };

  const toggleModule = (moduleId) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleMarkWatched = async () => {
    if (!user || !activeVideo) return;
    try {
      const { data } = await progressAPI.markWatched({ courseId: id, videoId: activeVideo._id });
      setProgress(data.progress);
      toast.success("Marked as watched!");
    } catch (e) {
      toast.error("Failed to update progress");
    }
  };

  const handleEnroll = async () => {
    if (!user) { router.push("/login"); return; }
    try {
      await courseAPI.enroll(id);
      toast.success("Enrolled successfully!");
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Enrollment failed");
    }
  };

  const handleRating = async () => {
    if (!user) { router.push("/login"); return; }
    try {
      await ratingAPI.add({ courseId: id, rating: myRating, comment: myComment });
      toast.success("Rating submitted!");
      const ratRes = await ratingAPI.getCourse(id);
      setRatings(ratRes.data.ratings);
      setMyRating(0);
      setMyComment("");
    } catch (e) {
      toast.error("Failed to submit rating");
    }
  };

  const handleCreateChat = async () => {
    if (!user) { router.push("/login"); return; }
    if (!chatSubject || !chatMessage) return;
    try {
      await chatAPI.create({ courseId: id, subject: chatSubject, message: chatMessage });
      toast.success("Doubt posted!");
      setChatSubject("");
      setChatMessage("");
      const chatRes = await chatAPI.getCourse(id);
      setChats(chatRes.data.chats);
    } catch (e) {
      toast.error("Failed to post doubt");
    }
  };

  const handleReply = async (chatId) => {
    if (!replyText) return;
    try {
      await chatAPI.reply(chatId, { message: replyText });
      setReplyText("");
      const chatRes = await chatAPI.getCourse(id);
      setChats(chatRes.data.chats);
    } catch (e) {
      toast.error("Failed to send reply");
    }
  };

  const isWatched = (videoId) => progress?.completedVideos?.some(v => v._id === videoId || v === videoId);
  const isEnrolled = user?.enrolledCourses?.includes(id);

  if (loading) {
    return (
      <div style={{ padding: "40px 24px" }}>
        <div className="container">
          <div className="skeleton" style={{ height: 400, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 30, width: "60%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 20, width: "40%" }} />
        </div>
      </div>
    );
  }

  if (!course) return <div style={{ padding: 80, textAlign: "center" }}>Course not found</div>;

  return (
    <div style={{ padding: "0 0 80px" }}>
      {/* Video Player */}
      <div className={styles.videoContainer}>
        {activeVideo ? (
          <iframe
            src={`https://www.youtube.com/embed/${extractVideoId(activeVideo.youtubeUrl)}?rel=0`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={activeVideo.title}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--foreground-muted)" }}>
            No video selected
          </div>
        )}
      </div>

      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          {/* Left: Details */}
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>{course.title}</h1>
                <p style={{ color: "var(--foreground-muted)", fontSize: 14, marginTop: 4 }}>
                  by {course.instructor} · {course.category}
                </p>
              </div>
              {user && activeVideo && (
                <button
                  onClick={handleMarkWatched}
                  className={`btn btn-sm ${isWatched(activeVideo._id) ? "btn-secondary" : "btn-primary"}`}
                  disabled={isWatched(activeVideo._id)}
                >
                  <HiOutlineCheck size={16} />
                  {isWatched(activeVideo._id) ? "Watched" : "Mark as Watched"}
                </button>
              )}
            </div>

            {/* Progress bar */}
            {progress && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)", marginBottom: 6 }}>
                  <span>Course Progress</span>
                  <span>{progress.completionPercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progress.completionPercentage}%` }} />
                </div>
              </div>
            )}

            {!isEnrolled && user && (
              <button onClick={handleEnroll} className="btn btn-primary btn-lg" style={{ marginBottom: 24, width: "100%" }}>
                {course.price > 0 ? `Enroll for ₹${course.price}` : "Enroll for Free"}
              </button>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border-light)", marginBottom: 24, overflowX: "auto" }}>
              {["content", "ratings", "doubts"].map((t) => (
                <button
                  key={t}
                  className="btn btn-ghost btn-sm"
                  style={{
                    borderBottom: tab === t ? "2px solid var(--foreground)" : "2px solid transparent",
                    borderRadius: 0, fontWeight: tab === t ? 600 : 400,
                    color: tab === t ? "var(--foreground)" : "var(--foreground-muted)",
                    whiteSpace: "nowrap"
                  }}
                  onClick={() => setTab(t)}
                >
                  {t === "content" ? "Overview" : t === "ratings" ? "Reviews" : "Doubts"}
                </button>
              ))}
            </div>

            {tab === "content" && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>About this course</h3>
                <p style={{ color: "var(--foreground-secondary)", fontSize: 14, lineHeight: 1.7 }}>
                  {course.description}
                </p>
              </div>
            )}

            {tab === "ratings" && (
              <div>
                {/* Add rating */}
                {user && (
                  <div className="card" style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Leave a Review</h4>
                    <div className="stars" style={{ marginBottom: 12 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} className={`star ${myRating >= s ? "filled" : "empty"}`}
                          onClick={() => setMyRating(s)} style={{ background: "none", border: "none", fontSize: 24 }}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Write your review..."
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      style={{ width: "100%", resize: "vertical", marginBottom: 12 }}
                    />
                    <button onClick={handleRating} className="btn btn-primary btn-sm" disabled={myRating === 0}>
                      Submit Review
                    </button>
                  </div>
                )}

                {/* Reviews list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {ratings.length === 0 && (
                    <p style={{ color: "var(--foreground-muted)", fontSize: 14 }}>No reviews yet. Be the first!</p>
                  )}
                  {ratings.map((r) => (
                    <div key={r._id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "var(--radius-full)",
                            background: "var(--accent)", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 12, fontWeight: 600,
                          }}>
                            {r.userId?.name?.charAt(0) || "U"}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{r.userId?.name}</span>
                        </div>
                        <div style={{ color: "#ffc107", fontSize: 13 }}>
                          {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                        </div>
                      </div>
                      {r.comment && <p style={{ fontSize: 13, color: "var(--foreground-secondary)" }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "doubts" && (
              <div>
                {/* New doubt */}
                {user && (
                  <div className="card" style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Ask a Doubt</h4>
                    <input
                      className="input"
                      placeholder="Subject"
                      value={chatSubject}
                      onChange={(e) => setChatSubject(e.target.value)}
                      style={{ width: "100%", marginBottom: 8 }}
                    />
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="Describe your doubt..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      style={{ width: "100%", resize: "vertical", marginBottom: 12 }}
                    />
                    <button onClick={handleCreateChat} className="btn btn-primary btn-sm">
                      <HiOutlineChatBubbleLeftRight size={16} /> Post Doubt
                    </button>
                  </div>
                )}

                {/* Chat threads */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {chats.length === 0 && (
                    <p style={{ color: "var(--foreground-muted)", fontSize: 14 }}>No doubts posted yet.</p>
                  )}
                  {chats.map((chat) => (
                    <div key={chat._id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 600 }}>{chat.subject}</h4>
                        <span className={`badge ${chat.status === "resolved" ? "badge-success" : "badge-warning"}`}>
                          {chat.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "12px 0" }}>
                        {chat.messages?.slice(-3).map((msg, i) => (
                          <div key={i} style={{
                            padding: "8px 12px", borderRadius: "var(--radius-md)",
                            background: msg.senderRole === "admin" ? "var(--info-bg)" : "var(--accent)",
                            fontSize: 13,
                          }}>
                            <span style={{ fontWeight: 500, fontSize: 12, color: "var(--foreground-muted)" }}>
                              {msg.sender?.name || (msg.senderRole === "admin" ? "Admin" : "You")}
                            </span>
                            <p style={{ marginTop: 2 }}>{msg.text}</p>
                          </div>
                        ))}
                      </div>
                      {chat.status === "open" && user && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            className="input"
                            placeholder="Reply..."
                            style={{ flex: 1 }}
                            value={activeChat === chat._id ? replyText : ""}
                            onFocus={() => setActiveChat(chat._id)}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <button
                            className="btn btn-primary btn-icon"
                            onClick={() => handleReply(chat._id)}
                          >
                            <IoSend size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Module Sidebar */}
          <aside className={styles.sidebar}>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Course Content</h3>
                <p style={{ fontSize: 12, color: "var(--foreground-muted)", marginTop: 2 }}>
                  {course.modules?.length || 0} modules · {videos.length} videos
                </p>
              </div>
              <div style={{ maxHeight: 500, overflowY: "auto" }}>
                {course.modules?.map((mod) => {
                  const moduleVideos = videos.filter((v) => v.moduleId === mod._id || v.moduleId?.toString() === mod._id?.toString());
                  return (
                    <div key={mod._id}>
                      <button
                        onClick={() => toggleModule(mod._id)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 20px", background: "var(--accent)", border: "none",
                          borderBottom: "1px solid var(--border-light)", cursor: "pointer",
                          color: "var(--foreground)", fontSize: 13, fontWeight: 500, textAlign: "left",
                        }}
                      >
                        {mod.title}
                        {openModules[mod._id] ? <HiOutlineChevronDown size={16} /> : <HiOutlineChevronRight size={16} />}
                      </button>
                      {openModules[mod._id] && moduleVideos.map((video) => (
                        <button
                          key={video._id}
                          onClick={() => setActiveVideo(video)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 20px", background: activeVideo?._id === video._id ? "var(--accent-hover)" : "transparent",
                            border: "none", borderBottom: "1px solid var(--border-light)",
                            cursor: "pointer", color: "var(--foreground-secondary)", fontSize: 13, textAlign: "left",
                          }}
                        >
                          {isWatched(video._id) ? (
                            <HiOutlineCheck size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
                          ) : (
                            <HiOutlinePlay size={16} style={{ flexShrink: 0 }} />
                          )}
                          <span style={{ flex: 1 }}>{video.title}</span>
                          <span style={{ fontSize: 11, color: "var(--foreground-muted)" }}>{video.duration}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
