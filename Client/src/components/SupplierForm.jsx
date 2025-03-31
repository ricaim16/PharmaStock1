import { useState, useEffect } from "react";
import { addSupplier, editSupplier } from "../api/supplierApi";

const SupplierForm = ({ supplier, onSupplierSaved, onClose }) => {
  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_info: "",
    payment_info_cbe: "",
    payment_info_coop: "",
    payment_info_boa: "",
    payment_info_awash: "",
    payment_info_ebirr: "",
    location: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_name: supplier.supplier_name || "",
        contact_info: supplier.contact_info || "",
        payment_info_cbe: supplier.payment_info_cbe || "",
        payment_info_coop: supplier.payment_info_coop || "",
        payment_info_boa: supplier.payment_info_boa || "",
        payment_info_awash: supplier.payment_info_awash || "",
        payment_info_ebirr: supplier.payment_info_ebirr || "",
        location: supplier.location || "",
        email: supplier.email || "",
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.supplier_name.trim()) return "Supplier name is required";
    if (!formData.contact_info.trim()) return "Contact info is required";
    if (!formData.location.trim()) return "Location is required";
    if (!/^\+?\d{9,13}$/.test(formData.contact_info)) {
      return "Contact info must be a valid phone number (9-13 digits, optional +)";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Invalid email format";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      let response;
      if (supplier?.id) {
        response = await editSupplier(supplier.id, formData);
      } else {
        response = await addSupplier(formData);
      }
      onSupplierSaved(response); // Pass the supplier object
      onClose();
    } catch (err) {
      console.error("Supplier save error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">
          {supplier?.id ? "Edit Supplier" : "Add New Supplier"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Supplier Name
              </label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Info
              </label>
              <input
                type="text"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CBE Payment Info
              </label>
              <input
                type="text"
                name="payment_info_cbe"
                value={formData.payment_info_cbe}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Coop Payment Info
              </label>
              <input
                type="text"
                name="payment_info_coop"
                value={formData.payment_info_coop}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                BOA Payment Info
              </label>
              <input
                type="text"
                name="payment_info_boa"
                value={formData.payment_info_boa}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Awash Payment Info
              </label>
              <input
                type="text"
                name="payment_info_awash"
                value={formData.payment_info_awash}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                eBirr Payment Info
              </label>
              <input
                type="text"
                name="payment_info_ebirr"
                value={formData.payment_info_ebirr}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Saving..." : supplier?.id ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
