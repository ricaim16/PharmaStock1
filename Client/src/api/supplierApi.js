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
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch suppliers"
    );
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const response = await axiosFileInstance.post("/suppliers", supplierData);
    return response.data;
  } catch (error) {
    console.error(
      "Create supplier error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.error ||
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
      supplierData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Update supplier error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.error ||
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
      error.response?.data?.error ||
      error.message ||
      "Failed to delete supplier"
    );
  }
};

// Other functions (unchanged for this fix but included for completeness)
export const addSupplierCredit = async (creditData) => {
  try {
    const response = await axiosFileInstance.post(
      "/suppliers/credits",
      creditData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const editSupplierCredit = async (id, creditData) => {
  try {
    const response = await axiosFileInstance.put(
      `/suppliers/credits/${id}`,
      creditData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const deleteSupplierCredit = async (id) => {
  try {
    const response = await axiosInstance.delete(`/suppliers/credits/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const getSupplierCredits = async (supplierId) => {
  try {
    const response = await axiosInstance.get(
      `/suppliers/credits/supplier/${supplierId}`
    );
    return response.data.credits;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const getAllSupplierCredits = async () => {
  try {
    const response = await axiosInstance.get("/suppliers/credits/report");
    return response.data.credits;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};
