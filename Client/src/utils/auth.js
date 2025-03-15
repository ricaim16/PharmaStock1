// utils/auth.js
import { axiosInstance } from "../api/axiosInstance";

export const getToken = () => localStorage.getItem("token");
export const getUserRole = () => localStorage.getItem("userRole");
export const getUserId = () => localStorage.getItem("userId");
export const getUsername = () => localStorage.getItem("username");

export const loginUser = async (username, password, role) => {
  try {
    const response = await axiosInstance.post("/users/login", {
      username,
      password,
      role,
    });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("username", user.username);
    return { token, user };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error.response?.data?.error || "Invalid credentials";
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
};
