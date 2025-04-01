import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ExpenseReport from "../components/ExpenseReport";

const ExpenseManagement = () => {
  const [editingExpense, setEditingExpense] = useState(null);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    // Optionally, navigate to the form route if not already there
    // You might need useNavigate from react-router-dom for this
  };

  const handleExpenseAdded = (expense) => {
    // Handle new expense addition (e.g., refresh list if needed)
    console.log("Expense added:", expense);
  };

  const handleExpenseUpdated = (expense) => {
    setEditingExpense(null); // Clear editing state after update
    console.log("Expense updated:", expense);
  };

  return (
    <ProtectedRoute allowedRoles={["MANAGER"]}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4 ml-64">
          <Routes>
            <Route
              path="/"
              element={
                <ExpenseForm
                  onExpenseAdded={handleExpenseAdded}
                  onExpenseUpdated={handleExpenseUpdated}
                  editingExpense={editingExpense}
                />
              }
            />
           
            <Route path="/list" element={<ExpenseList onEdit={handleEdit} />} />
            <Route path="/report" element={<ExpenseReport />} />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ExpenseManagement;
