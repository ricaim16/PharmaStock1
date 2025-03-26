import { axiosInstance } from "./axiosInstance";

const API_URL = "/sales";

export const getAllSales = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

export const getSaleById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

export const addSale = async (data) => {
  const response = await axiosInstance.post(API_URL, data);
  return response.data.sale; // Backend returns { message, sale }
};

export const editSale = async (id, data) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, data);
  return response.data.sale; // Backend returns { message, sale }
};

export const deleteSale = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

export const generateSalesReport = async (params) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/report`, { params });
    console.log("Sales Report Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Sales Report Error:", error.response?.data || error);
    throw error;
  }
};