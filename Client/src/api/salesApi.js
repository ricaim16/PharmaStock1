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
  return response.data.sale;
};

export const editSale = async (id, data) => {
  console.log(`[CLIENT] Sending PUT to ${API_URL}/${id} with data:`, data);
  const response = await axiosInstance.put(`${API_URL}/${id}`, data);
  return response.data.sale;
};

export const deleteSale = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

export const generateSalesReport = async (filters = {}) => {
  try {
    const { start_date, end_date, customer_id } = filters;
    const params = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    if (customer_id) params.customer_id = customer_id;

    const url = `${API_URL}/report`;
    console.log(
      "[CLIENT] Sending report request to:",
      `${axiosInstance.defaults.baseURL}${url}`,
      "with params:",
      params
    );
    const response = await axiosInstance.get(url, { params });
    console.log("[CLIENT] Sales Report Response:", response.data);
    return response.data;
  } catch (error) {
    const errorDetails = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    };
    console.error("[CLIENT] Sales Report Error:", errorDetails);
    throw error;
  }
};
