// src/api/config.js
// ─────────────────────────────────────────────────────────
// Central API helper for the Hamara Kisaan Admin Panel
// All pages import from here — change BASE_URL in one place
// ─────────────────────────────────────────────────────────

export const BASE_URL = "http://localhost:5000";   // Flask backend
export const API_BASE = BASE_URL;

// ── Generic fetch wrapper ──────────────────────────────────
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    credentials: "include",          // sends Flask session cookie
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  };
  const res = await fetch(url, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "API error");
  }
  return res.json();
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
export const authAPI = {
  login:     (username, password) =>
    apiCall("/api/admin/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout:    () => apiCall("/api/admin/logout", { method: "POST" }),
  checkAuth: () => apiCall("/api/admin/check-auth"),
};

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
export const dashboardAPI = {
  getStats: () => apiCall("/api/admin/dashboard"),
};

// ════════════════════════════════════════════════════════════
// FARMERS
// ════════════════════════════════════════════════════════════
export const farmersAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/farmers${qs ? "?" + qs : ""}`);
  },
  getOne:  (id)     => apiCall(`/api/admin/farmers/${id}`),
  delete:  (id)     => apiCall(`/api/admin/farmers/${id}`, { method: "DELETE" }),
};

// ════════════════════════════════════════════════════════════
// WEATHER
// ════════════════════════════════════════════════════════════
export const weatherAPI = {
  get: (city = "Rawalpindi") => apiCall(`/api/admin/weather?city=${encodeURIComponent(city)}`),
};

// ════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════
export const notificationsAPI = {
  getAll: ()       => apiCall("/api/admin/notifications"),
  send:   (data)   => apiCall("/api/admin/notifications", { method: "POST", body: JSON.stringify(data) }),
  delete: (id)     => apiCall(`/api/admin/notifications/${id}`, { method: "DELETE" }),
};

// ════════════════════════════════════════════════════════════
// SMS
// ════════════════════════════════════════════════════════════
export const smsAPI = {
  send:    (data) => apiCall("/api/admin/sms", { method: "POST", body: JSON.stringify(data) }),
  getLogs: ()     => apiCall("/api/admin/sms/logs"),
};

// ════════════════════════════════════════════════════════════
// ADVISORIES
// ════════════════════════════════════════════════════════════
export const advisoriesAPI = {
  getAll:  ()     => apiCall("/api/admin/advisories"),
  create:  (data) => apiCall("/api/admin/advisories", { method: "POST", body: JSON.stringify(data) }),
  delete:  (id)   => apiCall(`/api/admin/advisories/${id}`, { method: "DELETE" }),
};

// ════════════════════════════════════════════════════════════
// DIAGNOSIS
// ════════════════════════════════════════════════════════════
export const diagnosisAPI = {
  getLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/diagnosis${qs ? "?" + qs : ""}`);
  },
};

// ════════════════════════════════════════════════════════════
// CROPS
// ════════════════════════════════════════════════════════════
export const cropsAPI = {
  getOverview: () => apiCall("/api/admin/crops"),
};

// ════════════════════════════════════════════════════════════
// TREATMENTS
// ════════════════════════════════════════════════════════════
export const treatmentsAPI = {
  getAll: ()     => apiCall("/api/admin/treatments"),
  add:    (data) => apiCall("/api/admin/treatments", { method: "POST", body: JSON.stringify(data) }),
};

// ════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ════════════════════════════════════════════════════════════
export const activityAPI = {
  getAll: () => apiCall("/api/admin/activity"),
};
