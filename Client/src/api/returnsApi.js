// src/api/returnsApi.js
import { axiosInstance } from "./axiosInstance"; // Change to named import

const returnsApi = {
  getAllReturns: async () => {
    try {
      const response = await axiosInstance.get("/returns");
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Error fetching returns";
    }
  },

  getReturnById: async (id) => {
    try {
      const response = await axiosInstance.get(`/returns/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Error fetching return";
    }
  },

  addReturn: async (returnData) => {
    try {
      const response = await axiosInstance.post("/returns", returnData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Error adding return";
    }
  },

  updateReturn: async (id, returnData) => {
    try {
      const response = await axiosInstance.put(`/returns/${id}`, returnData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Error updating return";
    }
  },

  deleteReturn: async (id) => {
    try {
      const response = await axiosInstance.delete(`/returns/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Error deleting return";
    }
  },
};

export default returnsApi;
