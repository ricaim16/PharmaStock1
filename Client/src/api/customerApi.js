import { axiosInstance, axiosFileInstance } from "./axiosInstance.js";

const API_URL = "/customers";

export const getAllCustomers = async () => {
  console.log("Fetching all customers...");
  try {
    const response = await axiosInstance.get(API_URL);
    console.log("Get All Customers Response:", response.data);
    return response.data; // Should be an array
  } catch (error) {
    console.error("Get All Customers Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get Customer By ID Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const addCustomer = async (data) => {
  try {
    console.log("Adding customer with data:", data);
    const response = await axiosInstance.post(API_URL, data);
    console.log("Add Customer Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Add Customer Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const editCustomer = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Edit Customer Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Customer Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
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
    console.error("Get Credits Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const addCustomerCredit = async (data) => {
  try {
    const response = await axiosFileInstance.post(`${API_URL}/credits`, data);
    console.log("Add Credit Response:", response.data);
    return response.data.credit;
  } catch (error) {
    console.error("Add Credit Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const editCustomerCredit = async (id, data) => {
  try {
    const response = await axiosFileInstance.put(
      `${API_URL}/credits/${id}`,
      data
    );
    console.log("Edit Credit Response:", response.data);
    return response.data.credit;
  } catch (error) {
    console.error("Edit Credit Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const deleteCustomerCredit = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_URL}/credits/${id}`);
    console.log("Delete Credit Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Delete Credit Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const getAllMedicines = async () => {
  console.log("Fetching all medicines...");
  try {
    const response = await axiosInstance.get("/medicines");
    console.log("Get All Medicines Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get All Medicines Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

export const getCreditReport = async ({
  start_date,
  end_date,
  customer_id,
  limit = 100,
  offset = 0,
}) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/credits/report`, {
      params: { start_date, end_date, customer_id, limit, offset },
    });
    console.log("Get Credit Report Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get Credit Report Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
