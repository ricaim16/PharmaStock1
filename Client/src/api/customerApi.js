// api/customerApi.js
import { axiosInstance, axiosFileInstance } from "./axiosInstance.js";

const API_URL = "/customers";

export const getAllCustomers = async () => {
  console.log("Fetching all customers...");
  try {
    const response = await axiosInstance.get(API_URL);
    console.log("Get All Customers Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get All Customers Error:", error.message);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addCustomer = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editCustomer = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerCredits = async (customerId) => {
  console.log("Fetching credits for customerId:", customerId);
  try {
    const response = await axiosInstance.get(
      `${API_URL}/${customerId}/credits`
    );
    console.log("Get Credits Response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log("No credits found for customer:", customerId);
      return { credits: [], creditCount: 0 };
    }
    console.error(
      "Get Credits Error:",
      error.message,
      error.response?.status,
      error.response?.data
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch customer credits"
    );
  }
};

export const addCustomerCredit = async (data) => {
  const formData = new FormData();
  formData.append("customer_id", data.customer_id);
  formData.append("credit_amount", data.credit_amount);
  if (data.description) formData.append("description", data.description);
  if (data.status) formData.append("status", data.status);
  if (data.payment_file) formData.append("payment_file", data.payment_file);

  console.log("Adding customer credit with FormData:", [...formData.entries()]);
  try {
    const response = await axiosFileInstance.post(
      `${API_URL}/credits`,
      formData
    );
    console.log("Add Credit Response:", response.data);
    return response.data.credit; // Ensure backend returns { credit: {...} }
  } catch (error) {
    console.error(
      "Add Credit Error:",
      error.response?.status,
      error.response?.data
    );
    throw new Error(error.response?.data?.message || "Failed to add credit");
  }
};

export const editCustomerCredit = async (id, data) => {
  const formData = new FormData();
  if (data.customer_id) formData.append("customer_id", data.customer_id);
  if (data.credit_amount) formData.append("credit_amount", data.credit_amount);
  if (data.description !== undefined)
    formData.append("description", data.description);
  if (data.status) formData.append("status", data.status);
  if (data.payment_file) formData.append("payment_file", data.payment_file);

  try {
    const response = await axiosFileInstance.put(
      `${API_URL}/credits/${id}`,
      formData
    );
    return response.data.credit;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to edit credit");
  }
};

export const deleteCustomerCredit = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/credits/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generateCreditReport = async (params) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/credits/report`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
