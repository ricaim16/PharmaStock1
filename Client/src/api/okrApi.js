// src/api/okrApi.js
import { axiosInstance } from "./axiosInstance";

// Fetch all objectives
export const getObjectives = () => {
  return axiosInstance.get("/objectives"); // Matches GET /api/objectives
};

// Fetch all key results (fix: nest under /objectives)
export const getKeyResults = () => {
  return axiosInstance.get("/objectives/key-results"); // New endpoint needed
};

// Fetch a single objective by ID
export const getObjectiveById = (id) => {
  return axiosInstance.get(`/objectives/${id}`);
};

// Create a new objective
export const createObjective = (objectiveData) => {
  return axiosInstance.post("/objectives", objectiveData); // Matches POST /api/objectives
};

// Create a new key result (fix: nest under /objectives)
export const createKeyResult = (keyResultData) => {
  return axiosInstance.post("/objectives/key-results", keyResultData); // Matches POST /api/objectives/key-results
};

// Update an existing objective by ID
export const updateObjective = (id, objectiveData) => {
  return axiosInstance.put(`/objectives/${id}`, objectiveData);
};

// Update an existing key result by ID (fix: nest under /objectives)
export const updateKeyResult = (id, keyResultData) => {
  return axiosInstance.put(`/objectives/key-results/${id}`, keyResultData);
};

// Delete an objective by ID
export const deleteObjective = (id) => {
  return axiosInstance.delete(`/objectives/${id}`);
};

// Delete a key result by ID (fix: nest under /objectives)
export const deleteKeyResult = (id) => {
  return axiosInstance.delete(`/objectives/key-results/${id}`);
};

// Generate an OKR report for a date range
export const generateOKRReport = (startDate, endDate) => {
  return axiosInstance.get("/objectives/okr-report", {
    // Fix: nest under /objectives
    params: { startDate, endDate },
  });
};
