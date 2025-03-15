// src/api/memberApi.js
import { axiosInstance, axiosFileInstance } from "./axiosInstance";

// Create a new member
export const createMember = async (memberData) => {
  try {
    const response = await axiosFileInstance.post(`/members/`, memberData);
    return response.data;
  } catch (error) {
    console.error(
      "Create member failed:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || error.message;
  }
};

// Fetch all members
export const getAllMembers = async () => {
  try {
    const response = await axiosInstance.get(`/members/`);
    return response.data;
  } catch (error) {
    console.error(
      "Get all members failed:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || error.message;
  }
};

// Fetch a single member by ID
export const getMemberById = async (id) => {
  try {
    const response = await axiosInstance.get(`/members/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get member failed:", error.response?.data || error.message);
    throw error.response?.data?.error || error.message;
  }
};

// Update a member
export const updateMember = async (id, memberData) => {
  try {
    const response = await axiosFileInstance.put(`/members/${id}`, memberData);
    return response.data;
  } catch (error) {
    console.error(
      "Update member failed:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || error.message;
  }
};

// Update the logged-in member's own profile
export const updateSelfMember = async (memberData) => {
  try {
    const response = await axiosFileInstance.put(`/members/self`, memberData);
    return response.data;
  } catch (error) {
    console.error(
      "Update self member failed:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || error.message;
  }
};

// Delete a member
export const deleteMember = async (id) => {
  try {
    const response = await axiosInstance.delete(`/members/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete member failed:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || error.message;
  }
};
