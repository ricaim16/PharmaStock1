import React, { useState, useEffect } from "react";
import { expenseApi } from "../api/expenseApi";
import ExpenseForm from "./ExpenseForm";
import { jwtDecode } from "jwt-decode";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role.toUpperCase());
    } catch (err) {
      setError("Invalid token format. Please log in again.");
      setLoading(false);
      return;
    }
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await expenseApi.getAllExpenses();
      setExpenses(
        data.sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date
      );
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseApi.deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense.id !== id));
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to delete expense");
      }
    }
  };

  const handleSave = (newExpense) => {
    setExpenses((prev) =>
      selectedExpense
        ? prev.map((exp) => (exp.id === newExpense.id ? newExpense : exp))
        : [newExpense, ...prev]
    );
    setIsFormOpen(false);
    setSelectedExpense(null);
    fetchExpenses(); // Refresh the list
  };

  if (loading) return <p>Loading expenses...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Expenses</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600"
      >
        Add Expense
      </button>
      {isFormOpen && (
        <ExpenseForm
          expense={selectedExpense}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      {expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Category (Reason)</th>
                <th className="p-2 border">Payment Method</th>
                <th className="p-2 border">Receipt</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Additional Info</th>
                {userRole === "MANAGER" && (
                  <th className="p-2 border">Created By</th>
                )}
                {userRole === "MANAGER" && (
                  <th className="p-2 border">Updated By</th>
                )}
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-100">
                  <td className="p-2 border">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 border">{expense.reason}</td>
                  <td className="p-2 border">
                    {expense.payment_method || "-"}
                  </td>
                  <td className="p-2 border">{expense.receipt || "-"}</td>
                  <td className="p-2 border">{expense.amount}</td>
                  <td className="p-2 border">{expense.description || "-"}</td>
                  <td className="p-2 border">
                    {expense.additional_info || "-"}
                  </td>
                  {userRole === "MANAGER" && (
                    <td className="p-2 border">
                      {expense.createdBy?.username || "N/A"}
                    </td>
                  )}
                  {userRole === "MANAGER" && (
                    <td className="p-2 border">
                      {expense.updatedBy?.username || "N/A"}
                    </td>
                  )}
                  <td className="p-2 border">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
