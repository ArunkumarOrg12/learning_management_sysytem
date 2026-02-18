import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

// Courses
export const courseAPI = {
  getAll: (params) => api.get("/courses", { params }),
  getTrending: () => api.get("/courses/trending"),
  getOne: (id) => api.get(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  getAdminAll: () => api.get("/courses/admin/all"),
};

// Videos
export const videoAPI = {
  getCourseVideos: (courseId) => api.get(`/videos/course/${courseId}`),
  add: (data) => api.post("/videos", data),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
};

// Progress
export const progressAPI = {
  get: (courseId) => api.get(`/progress/${courseId}`),
  getAll: () => api.get("/progress"),
  markWatched: (data) => api.put("/progress/mark-watched", data),
  updatePosition: (data) => api.put("/progress/update-position", data),
};

// Ratings
export const ratingAPI = {
  add: (data) => api.post("/ratings", data),
  getCourse: (courseId) => api.get(`/ratings/${courseId}`),
};

// Chats / Doubts
export const chatAPI = {
  create: (data) => api.post("/chats", data),
  getCourse: (courseId) => api.get(`/chats/course/${courseId}`),
  reply: (id, data) => api.put(`/chats/${id}/reply`, data),
  resolve: (id) => api.put(`/chats/${id}/resolve`),
  getAll: (params) => api.get("/chats/admin/all", { params }),
};

// Payments
export const paymentAPI = {
  createOrder: (data) => api.post("/payments/create-order", data),
  verify: (data) => api.post("/payments/verify", data),
  getAll: (params) => api.get("/payments", { params }),
  getMy: () => api.get("/payments/my"),
};

// Notifications
export const notificationAPI = {
  get: () => api.get("/notifications"),
  getAll: () => api.get("/notifications/admin/all"),
  create: (data) => api.post("/notifications", data),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Certificates
export const certificateAPI = {
  getMy: () => api.get("/certificates"),
  generate: (data) => api.post("/certificates/generate", data),
  getOne: (id) => api.get(`/certificates/${id}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getStudents: (params) => api.get("/admin/students", { params }),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
};

export default api;
