
import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://http-request-monitoring-system.onrender.com"
});

export const getRequests = async () => {
  const response = await API.get("/api/requests");
  return response.data;
};

export const addRequest = async (requestData) => {
  const response = await API.post("/api/requests", requestData);
  return response.data;
};

export default API;
