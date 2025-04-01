import React, { useState, useEffect } from "react";
import { expenseApi } from "../api/expenseApi";

const ExpenseForm = ({ expense, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    reason: "",
    amount: "",
    description: "",
    date: "",
    payment_method: "NONE",
    receipt: null,
    additional_info: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    "NONE",
    "CASH",
    "CREDIT",
    "CBE",
    "COOP",
    "AWASH",
    "EBIRR",
  ];

  useEffect(() => {
    if (expense) {
      setFormData({
        reason: expense.reason || "",
        amount: expense.amount || "",
        description: expense.description || "",
        date: expense.date ? expense.date.split("T")[0] : "",
        payment_method: expense.payment_method || "NONE",
        receipt: null, // File input can't be pre-populated
        additional_info: expense.additional_info || "",
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "receipt") {
      setFormData({ ...formData, receipt: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append("reason", formData.reason);
    data.append("amount", formData.amount);
    data.append("description", formData.description);
    data.append("date", formData.date);
    data.append("payment_method", formData.payment_method);
    if (formData.receipt) {
      data.append("receipt", formData.receipt);
    }
    data.append("additional_info", formData.additional_info);

    try {
      const response = expense
        ? await expenseApi.updateExpense(expense.id, data)
        : await expenseApi.addExpense(data);
      onSave(response.expense);
    } catch (err) {
      setError(err.message || "Failed to process expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="p-4 bg-white rounded shadow mb-4"
    >
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <h2 className="text-xl font-bold mb-4">
        {expense ? "Edit Expense" : "Add Expense"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Category (Reason)</label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Receipt (Image)</label>
          <input
            type="file"
            name="receipt"
            onChange={handleChange}
            accept=".jpg,.jpeg,.png"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Additional Info</label>
          <textarea
            name="additional_info"
            value={formData.additional_info}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
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

export default ExpenseForm;
