// components/CustomerCreditForm.jsx
import { useState, useEffect } from "react";
import { addCustomerCredit, editCustomerCredit } from "../api/customerApi.js";

const CustomerCreditForm = ({ customerId, credit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_id: customerId || "", // Still included in state but not shown in UI
    credit_amount: "",
    description: "",
    status: "UNPAID",
    payment_file: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (credit) {
      setFormData({
        customer_id: credit.customer_id || customerId,
        credit_amount: credit.credit_amount || "",
        description: credit.description || "",
        status: credit.status || "UNPAID",
        payment_file: null,
      });
    } else {
      setFormData((prev) => ({ ...prev, customer_id: customerId }));
    }
  }, [credit, customerId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.customer_id) {
      setError("Customer ID is missing.");
      setLoading(false);
      return;
    }
    if (
      !formData.credit_amount ||
      isNaN(formData.credit_amount) ||
      parseFloat(formData.credit_amount) <= 0
    ) {
      setError("Please enter a valid credit amount.");
      setLoading(false);
      return;
    }

    try {
      let savedCredit;
      if (credit) {
        savedCredit = await editCustomerCredit(credit.id, formData);
      } else {
        savedCredit = await addCustomerCredit(formData);
      }
      if (!savedCredit || typeof savedCredit !== "object") {
        throw new Error("Invalid credit data returned from server");
      }
      onSave(savedCredit);
    } catch (err) {
      setError(err.message || "Failed to save credit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {credit ? "Edit Credit" : "Add Credit"}
        </h3>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Removed Customer ID field from UI */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credit Amount
            </label>
            <input
              type="number"
              name="credit_amount"
              value={formData.credit_amount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Optional description"
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
            >
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment File
            </label>
            <input
              type="file"
              name="payment_file"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            {credit && credit.payment_file && !formData.payment_file && (
              <p className="text-sm text-gray-600">
                Current file: {credit.payment_file}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? "Saving..." : credit ? "Update Credit" : "Add Credit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCreditForm;
