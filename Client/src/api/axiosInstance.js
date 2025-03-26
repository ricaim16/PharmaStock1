import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

export const axiosFileInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "multipart/form-data" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Request:", config.method, config.url, "Token:", token);
  return config;
});

axiosFileInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Request:", config.method, config.url, "Token:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config.url !== "/users/login") {
      console.log("Unauthorized - Logging out...");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

axiosFileInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config.url !== "/users/login") {
      console.log("Unauthorized - Logging out...");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
