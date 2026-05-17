import axios from "axios";

// Backend URL
const BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : "https://recommender-system-ef15.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
});

// Add token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// LOGIN
export const login = async (data) => {
  const response = await API.post("/auth/login", data);

  // Save token + user
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));

  // Redirect after login
  window.location.href = "/dashboard";

  return response.data;
};

// AUTH
export const register = (data) => API.post("/auth/register", data);
export const getMe = () => API.get("/auth/me");
export const updateMe = (data) => API.put("/auth/me", data);

// ITEMS
export const getItems = (params) => API.get("/items", { params });
export const getItem = (id) => API.get(`/items/${id}`);
export const createItem = (data) => API.post("/items", data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const deleteItem = (id) => API.delete(`/items/${id}`);

// RECOMMENDATIONS
export const getRecommendations = () => API.get("/recommendations");
export const sendFeedback = (data) =>
  API.post("/recommendations/feedback", data);
export const getAgentStats = () =>
  API.get("/recommendations/agent-stats");

// AGENTS
export const getAgents = () => API.get("/agents");
export const getMetrics = () => API.get("/agents/metrics");

export default API;