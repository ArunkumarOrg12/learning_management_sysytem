"use client";

import { useState, useEffect } from "react";
import { courseAPI, videoAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "Web Development",
    price: 0, instructor: "", thumbnail: "", isPublished: false,
    modules: [{ title: "Module 1", order: 0 }],
  });

  // Video modal
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [videoForm, setVideoForm] = useState({ title: "", youtubeUrl: "", duration: "0:00", order: 0 });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await courseAPI.getAdminAll();
      setCourses(data.courses);
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    try {
      if (editCourse) {
        await courseAPI.update(editCourse._id, form);
        toast.success("Course updated");
      } else {
        await courseAPI.create(form);
        toast.success("Course created");
      }
      setShowModal(false);
      setEditCourse(null);
      resetForm();
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course?")) return;
    try {
      await courseAPI.delete(id);
      toast.success("Course deleted");
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  };

  const handleAddVideo = async () => {
    try {
      await videoAPI.add({
        ...videoForm,
        courseId: selectedCourse._id,
        moduleId: selectedModule,
      });
      toast.success("Video added");
      setShowVideoModal(false);
      setVideoForm({ title: "", youtubeUrl: "", duration: "0:00", order: 0 });
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const resetForm = () => {
    setForm({
      title: "", description: "", category: "Web Development",
      price: 0, instructor: "", thumbnail: "", isPublished: false,
      modules: [{ title: "Module 1", order: 0 }],
    });
  };

  const openEdit = (course) => {
    setEditCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      instructor: course.instructor,
      thumbnail: course.thumbnail,
      isPublished: course.isPublished,
      modules: course.modules || [{ title: "Module 1", order: 0 }],
    });
    setShowModal(true);
  };

  const addModule = () => {
    setForm({ ...form, modules: [...form.modules, { title: `Module ${form.modules.length + 1}`, order: form.modules.length }] });
  };

  const removeModule = (idx) => {
    setForm({ ...form, modules: form.modules.filter((_, i) => i !== idx) });
  };

  const updateModule = (idx, value) => {
    const mods = [...form.modules];
    mods[idx].title = value;
    setForm({ ...form, modules: mods });
  };

  const categories = ["Web Development", "Mobile Development", "Data Science", "Machine Learning", "DevOps", "Design", "Business", "Other"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>Manage Courses</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditCourse(null); setShowModal(true); }}>
          <HiOutlinePlus size={18} /> Add Course
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Price</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "var(--foreground-muted)" }}>{c.instructor}</div>
                  </td>
                  <td><span className="badge badge-info">{c.category}</span></td>
                  <td style={{ fontWeight: 600, fontSize: 14 }}>{c.price > 0 ? `₹${c.price}` : "Free"}</td>
                  <td>{c.enrolledCount}</td>
                  <td>
                    <span className={`badge ${c.isPublished ? "badge-success" : "badge-warning"}`}>
                      {c.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => openEdit(c)}>
                        <HiOutlinePencil size={16} />
                      </button>
                      <button className="btn btn-ghost btn-icon" title="Add Video"
                        onClick={() => { setSelectedCourse(c); setSelectedModule(c.modules?.[0]?._id); setShowVideoModal(true); }}>
                        <HiOutlinePlus size={16} />
                      </button>
                      <button className="btn btn-ghost btn-icon" title="Delete" onClick={() => handleDelete(c._id)}>
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{editCourse ? "Edit Course" : "Add Course"}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><IoClose size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label>Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-group">
                  <label>Category</label>
                  <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Price (₹)</label>
                  <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
              </div>
              <div className="input-group">
                <label>Instructor</label>
                <input className="input" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Thumbnail URL</label>
                <input className="input" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
              </div>

              {/* Modules */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground-secondary)" }}>Modules</label>
                  <button className="btn btn-ghost btn-sm" onClick={addModule}><HiOutlinePlus size={14} /> Add Module</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {form.modules.map((mod, i) => (
                    <div key={i} style={{ display: "flex", gap: 6 }}>
                      <input className="input" style={{ flex: 1 }} value={mod.title} onChange={(e) => updateModule(i, e.target.value)} />
                      {form.modules.length > 1 && (
                        <button className="btn btn-ghost btn-icon" onClick={() => removeModule(i)}>
                          <IoClose size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                Publish course
              </label>

              <button className="btn btn-primary btn-lg" style={{ marginTop: 8 }} onClick={handleSubmit}>
                {editCourse ? "Update Course" : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>Add Video to {selectedCourse?.title}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowVideoModal(false)}><IoClose size={20} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label>Module</label>
                <select className="input" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                  {selectedCourse?.modules?.map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Video Title</label>
                <input className="input" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} />
              </div>
              <div className="input-group">
                <label>YouTube URL</label>
                <input className="input" placeholder="https://youtube.com/watch?v=..." value={videoForm.youtubeUrl} onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-group">
                  <label>Duration</label>
                  <input className="input" placeholder="10:30" value={videoForm.duration} onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Order</label>
                  <input type="number" className="input" value={videoForm.order} onChange={(e) => setVideoForm({ ...videoForm, order: Number(e.target.value) })} />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAddVideo}>Add Video</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
