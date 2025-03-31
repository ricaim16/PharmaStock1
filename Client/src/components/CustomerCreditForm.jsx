import { useState, useEffect } from "react";
import {
  addCustomerCredit,
  editCustomerCredit,
  getAllCustomers,
  getAllMedicines,
} from "../api/customerApi.js";

const CustomerCreditForm = ({ customerId, credit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_id: customerId || "",
    credit_amount: "",
    paid_amount: "0",
    medicine_name: "",
    payment_method: "NONE",
    description: "",
    payment_file: null,
  });
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchMedicines();
    if (credit) {
      console.log("Editing credit, setting formData:", credit);
      setFormData({
        customer_id: credit.customer_id || customerId || "",
        credit_amount: credit.credit_amount?.toString() || "",
        paid_amount: credit.paid_amount?.toString() || "0",
        medicine_name: credit.medicine_name || "",
        payment_method: credit.payment_method || "NONE",
        description: credit.description || "",
        payment_file: null, // File isn’t pre-filled for edits
      });
    } else if (customerId) {
      setFormData((prev) => ({
        ...prev,
        customer_id: customerId,
      }));
    }
  }, [credit, customerId]);

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      console.log("Fetched customers in form:", data);
      setCustomers(data || []);
      if (!data || data.length === 0) {
        setError("No customers available. Please add a customer first.");
      }
    } catch (err) {
      setError(
        "Failed to fetch customers: " + (err.message || "Unknown error")
      );
    }
  };

  const fetchMedicines = async () => {
    try {
      const data = await getAllMedicines();
      setMedicines(data || []);
      if (!data || data.length === 0) {
        setError("No medicines available. Please add a medicine first.");
      }
    } catch (err) {
      setError(
        "Failed to fetch medicines: " + (err.message || "Unknown error")
      );
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;
    console.log(`Changing ${name} to:`, newValue);
    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      console.log(
        "Updated formData after change:",
        JSON.stringify(updated, null, 2)
      );
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log(
      "Form data before submission:",
      JSON.stringify(formData, null, 2)
    );

    if (!formData.customer_id.trim()) {
      setError("Please select a customer.");
      setLoading(false);
      return;
    }
    const creditAmount = parseFloat(formData.credit_amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      setError("Please enter a valid credit amount greater than 0.");
      setLoading(false);
      return;
    }
    const paidAmount = parseFloat(formData.paid_amount);
    if (isNaN(paidAmount) || paidAmount < 0) {
      setError("Please enter a valid paid amount (0 or greater).");
      setLoading(false);
      return;
    }
    if (!formData.medicine_name.trim()) {
      setError("Please select a medicine.");
      setLoading(false);
      return;
    }

    const submissionData = new FormData();
    console.log("Building FormData explicitly:");
    submissionData.append("customer_id", formData.customer_id);
    submissionData.append("credit_amount", formData.credit_amount);
    submissionData.append("paid_amount", formData.paid_amount);
    submissionData.append("medicine_name", formData.medicine_name);
    submissionData.append("payment_method", formData.payment_method);
    submissionData.append("description", formData.description);
    if (formData.payment_file) {
      submissionData.append("payment_file", formData.payment_file);
    }

    const entries = [...submissionData.entries()];
    console.log("FormData entries being sent:", entries);

    const hasCustomerId = entries.some(
      ([key, val]) => key === "customer_id" && val
    );
    const hasCreditAmount = entries.some(
      ([key, val]) => key === "credit_amount" && val
    );
    if (!hasCustomerId || !hasCreditAmount) {
      setError("FormData is missing customer_id or credit_amount.");
      console.error("Missing fields:", { hasCustomerId, hasCreditAmount });
      setLoading(false);
      return;
    }

    try {
      let savedCredit;
      if (credit) {
        console.log("Submitting edit for credit ID:", credit.id);
        savedCredit = await editCustomerCredit(credit.id, submissionData);
      } else {
        console.log("Submitting new credit");
        savedCredit = await addCustomerCredit(submissionData);
      }
      if (!savedCredit || typeof savedCredit !== "object") {
        throw new Error("Invalid credit data returned from server");
      }
      console.log("Credit saved successfully:", savedCredit);
      onSave(savedCredit);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to save credit"
      );
      console.error("Submission error:", err.response?.data || err);
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={loading || (customerId && credit)}
            >
              <option value="">Select a customer</option>
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name}
                </option>
              ))}
            </select>
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
              className="w-full p-2 border rounded"
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
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
              className="w-full p-2 border rounded"
              placeholder="Enter paid amount"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Medicine Name
            </label>
            <select
              name="medicine_name"
              value={formData.medicine_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a medicine</option>
              {medicines.map((med) => (
                <option key={med.id} value={med.medicine_name}>
                  {med.medicine_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="NONE">None</option>
              <option value="CASH">Cash</option>
              <option value="CREDIT">Credit</option>
              <option value="CBE">CBE</option>
              <option value="COOP">Coop</option>
              <option value="AWASH">Awash</option>
              <option value="EBIRR">Ebirr</option>
            </select>
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
              Payment File
            </label>
            <input
              type="file"
              name="payment_file"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              accept="image/jpeg,image/png,application/pdf"
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
