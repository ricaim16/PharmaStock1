import axios from "axios";

const API_URL = "http://localhost:5000/api/users"; // Adjust to your backend URL

export const loginUser = async (username, password, role) => {
  const response = await axios.post(`${API_URL}/login`, {
    username,
    password,
    role,
  }); // Add role here
  const { token, user } = response.data;
  localStorage.setItem("token", token);
  localStorage.setItem("userRole", user.role);
  localStorage.setItem("userId", user.id);
  return { token, user };
};

export const getToken = () => localStorage.getItem("token");
export const getUserRole = () => localStorage.getItem("userRole");
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
};

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust to your backend URL
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
