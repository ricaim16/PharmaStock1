import { useState, useEffect } from "react";
import {
  addSupplierCredit,
  editSupplierCredit,
  getAllSuppliers,
} from "../api/supplierApi";

const SupplierCreditForm = ({ credit, onCreditSaved, onClose }) => {
  const [formData, setFormData] = useState({
    supplier_id: "",
    credit_amount: "",
    paid_amount: "0",
    description: "",
    payment_method: "NONE", // Default to NONE
    payment_file: null,
  });
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAllSuppliers();
        setSuppliers(data || []);
      } catch (err) {
        setError(err || "Failed to fetch suppliers");
      }
    };
    fetchSuppliers();

    if (credit) {
      setFormData({
        supplier_id: credit.supplier_id || "",
        credit_amount: credit.credit_amount || "",
        paid_amount: credit.paid_amount || "0",
        description: credit.description || "",
        payment_method: credit.payment_method || "NONE", // Ensure correct initialization
        payment_file: null,
      });
    }
  }, [credit]);

  // Effect to set payment method to NONE if paid amount is 0
  useEffect(() => {
    if (parseFloat(formData.paid_amount) === 0) {
      setFormData((prev) => ({
        ...prev,
        payment_method: "NONE",
      }));
    }
  }, [formData.paid_amount]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      let response;
      if (credit && credit.id) {
        response = await editSupplierCredit(credit.id, data);
      } else {
        response = await addSupplierCredit(data);
      }
      setError("");
      onCreditSaved(response);
      onClose();
    } catch (err) {
      setError(err.message || err || "Failed to save credit");
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
          {credit ? "Edit Supplier Credit" : "Add Supplier Credit"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            {credit ? (
              <p className="mt-1 px-4 py-2 border rounded-md bg-gray-100">
                {suppliers.find((s) => s.id === credit.supplier_id)
                  ?.supplier_name || "Unknown"}
              </p>
            ) : (
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplier_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credit Amount
            </label>
            <input
              type="number"
              name="credit_amount"
              value={formData.credit_amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paid Amount
            </label>
            <input
              type="number"
              name="paid_amount"
              value={formData.paid_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">None</option>
              <option value="CASH">Cash</option>
              <option value="CBE">CBE</option>
              <option value="COOP">Coop</option>
              <option value="AWASH">Awash</option>
              <option value="EBIRR">eBirr</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment File (optional)
            </label>
            <input
              type="file"
              name="payment_file"
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
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
              {loading ? "Saving..." : credit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierCreditForm;
