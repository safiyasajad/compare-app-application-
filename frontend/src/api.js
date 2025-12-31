import axios from "axios";

// This points to your Python backend
const API_BASE_URL = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// The function to trigger the analysis
export const analyzeProfile = async (url) => {
  const response = await api.post("/analyze", { url, is_cs_ai: true });
  return response.data;
};