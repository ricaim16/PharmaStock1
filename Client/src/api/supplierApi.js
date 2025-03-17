import { axiosInstance, axiosFileInstance } from "./axiosInstance";

export const getAllSuppliers = async () => {
  try {
    const response = await axiosInstance.get("/suppliers");
    return response.data;
  } catch (error) {
    console.error(
      "Get all suppliers error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch suppliers"
    );
  }
};

export const getSupplierById = async (id) => {
  try {
    const response = await axiosInstance.get(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get supplier by ID error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch supplier"
    );
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const response = await axiosFileInstance.post("/suppliers", supplierData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Create supplier error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to create supplier"
    );
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await axiosFileInstance.put(
      `/suppliers/${id}`,
      supplierData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Update supplier error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to update supplier"
    );
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await axiosInstance.delete(`/suppliers/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete supplier error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to delete supplier"
    );
  }
};

export const addSupplierCredit = async (creditData) => {
  try {
    const response = await axiosFileInstance.post(
      "/suppliers/credits",
      creditData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Add supplier credit error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to add supplier credit"
    );
  }
};

export const editSupplierCredit = async (id, creditData) => {
  try {
    const response = await axiosFileInstance.put(
      `/suppliers/credits/${id}`,
      creditData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Edit supplier credit error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to edit supplier credit"
    );
  }
};

export const deleteSupplierCredit = async (id) => {
  try {
    const response = await axiosInstance.delete(`/suppliers/credits/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete supplier credit error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to delete supplier credit"
    );
  }
};

export const getSupplierCredits = async (supplierId) => {
  try {
    const response = await axiosInstance.get(
      `/suppliers/credits/supplier/${supplierId}`
    );
    return response.data.credits;
  } catch (error) {
    console.error(
      "Get supplier credits error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch supplier credits"
    );
  }
};

export const getAllSupplierCredits = async () => {
  try {
    const response = await axiosInstance.get("/suppliers/credits/report");
    return response.data.credits;
  } catch (error) {
    console.error(
      "Get all supplier credits error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch all supplier credits"
    );
  }
};

// Note: getUserById seems unrelated to suppliers; I'll leave it as is unless you specify otherwise
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get user by ID error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message || error.message || "Failed to fetch user"
    );
  }
};
