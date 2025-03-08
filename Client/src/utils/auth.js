import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create a default axios instance for JSON requests
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Create a separate axios instance for file uploads
export const axiosFileInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor to add Authorization token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosFileInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Do not override Content-Type if it's already set (e.g., for FormData)
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "multipart/form-data";
  }
  return config;
});

// User-related API calls
export const loginUser = async (username, password, role) => {
  const response = await axiosInstance.post(`${API_URL}/users/login`, {
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
};

export const createUser = async (userData) => {
  const response = await axiosInstance.post(`${API_URL}/users/`, userData);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axiosInstance.get(`${API_URL}/users/`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`${API_URL}/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/users/${id}`);
  return response.data;
};

// Member-related API calls
export const createMember = async (memberData) => {
  const response = await axiosFileInstance.post(
    `${API_URL}/members/`,
    memberData
  );
  return response.data;
};

export const getAllMembers = async () => {
  const response = await axiosInstance.get(`${API_URL}/members/`);
  return response.data;
};

export const getMemberById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/members/${id}`);
  return response.data;
};

export const updateMember = async (id, memberData) => {
  const response = await axiosFileInstance.put(
    `${API_URL}/members/${id}`,
    memberData
  );
  return response.data;
};

export const updateSelfMember = async (memberData) => {
  const response = await axiosFileInstance.put(
    `${API_URL}/members/self`,
    memberData
  );
  return response.data;
};

export const deleteMember = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/members/${id}`);
  return response.data;
};

export const getToken = () => localStorage.getItem("token");
export const getUserRole = () => localStorage.getItem("userRole");
export const getUserId = () => localStorage.getItem("userId");
export const getUsername = () => localStorage.getItem("username");

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
};
