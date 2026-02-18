import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Auto-Refresh Interceptor ─────────────────────────────────────────────────
// On any 401 with code TOKEN_EXPIRED, silently call /auth/refresh and retry once.
// On SESSION_INVALIDATED or refresh failure, redirect to the appropriate login page.

let isRefreshing = false;
let failedQueue = []; // queue of { resolve, reject } for concurrent requests during refresh

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const data = error.response?.data;

    // Don't retry refresh calls themselves to avoid infinite loops
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && data?.code === "TOKEN_EXPIRED" && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — redirect to appropriate login
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Session invalidated by a new login elsewhere
    if (error.response?.status === 401 && data?.code === "SESSION_INVALIDATED") {
      redirectToLogin(data.message);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

function redirectToLogin(message) {
  if (typeof window === "undefined") return;
  const isAdminPath = window.location.pathname.startsWith("/admin");
  const loginPath = isAdminPath ? "/admin/login" : "/login";
  if (!window.location.pathname.includes("/login")) {
    if (message) {
      sessionStorage.setItem("auth_message", message);
    }
    window.location.href = loginPath;
  }
}

// ─── API Modules ──────────────────────────────────────────────────────────────

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),          // students only
  adminLogin: (data) => api.post("/auth/admin/login", data), // admins only
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
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
