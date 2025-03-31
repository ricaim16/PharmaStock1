import { useState, useEffect } from "react";
import { addCustomer, editCustomer } from "../api/customerApi";

const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    status: "ACTIVE",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        status: customer.status || "ACTIVE",
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.name || !formData.phone || !formData.address) {
      setError("Name, phone, and address are required.");
      setIsSubmitting(false);
      return;
    }

    // Basic phone format check before sending
    if (!/^\+?\d{9,13}$/.test(formData.phone)) {
      setError("Phone must be 9-13 digits, optionally starting with +.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Submitting customer data:", formData);
      let response;
      if (customer) {
        response = await editCustomer(customer.id, formData);
      } else {
        response = await addCustomer(formData);
      }
      console.log("Customer save response:", response);
      onSave(response.customer || response);
    } catch (err) {
      console.error("Error saving customer:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || "Failed to save customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow mb-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex space-x-4 mt-4">
        <button
          type="submit"
          className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
