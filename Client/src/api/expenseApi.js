import { axiosInstance } from "./axiosInstance";

export const expenseApi = {
  addExpense: async (expenseData) => {
    try {
      const response = await axiosInstance.post("/expenses", expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAllExpenses: async () => {
    try {
      const response = await axiosInstance.get("/expenses");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getExpenseReport: async () => {
    try {
      const response = await axiosInstance.get("/expenses/report");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateExpense: async (id, expenseData) => {
    try {
      const response = await axiosInstance.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteExpense: async (id) => {
    try {
      const response = await axiosInstance.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
