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
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosFileInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config.url !== "/users/login") {
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
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getAllMembers = async () => {
  const response = await axiosInstance.get("/members/");
  return response.data;
};

export const createMember = async (memberData) => {
  const response = await axiosFileInstance.post("/members/", memberData);
  return response.data;
};

export const updateMember = async (id, memberData) => {
  const response = await axiosFileInstance.put(`/members/${id}`, memberData);
  return response.data;
};

export const updateSelfMember = async (memberData) => {
  const response = await axiosFileInstance.put("/members/self", memberData);
  return response.data;
};

export const deleteMember = async (id) => {
  const response = await axiosInstance.delete(`/members/${id}`);
  return response.data;
};

export const getMemberById = async (id) => {
  const response = await axiosInstance.get(`/members/${id}`);
  return response.data;
};
