import React, { useEffect, useState } from "react";
import { expenseApi } from "../api/expenseApi";

const ExpenseReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await expenseApi.getExpenseReport();
        setReport(data || { totalExpenses: 0, expensesByCategory: [] });
      } catch (err) {
        setError(err.message || "Failed to fetch expense report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return <p>Loading report...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!report) return <p>No report data available.</p>;

  return (
    <div className="p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Expense Report</h2>
      <p className="text-lg">Total Expenses: {report.totalExpenses || 0}</p>
      <h3 className="text-lg font-semibold mt-4">Expenses by Category</h3>
      {report.expensesByCategory.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table className="w-full border-collapse mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Total Amount</th>
              <th className="p-2 border">Count</th>
            </tr>
          </thead>
          <tbody>
            {report.expensesByCategory.map((cat, index) => (
              <tr key={cat.category || index}>
                <td className="p-2 border">{cat.category || "Unknown"}</td>
                <td className="p-2 border">{cat.total || 0}</td>
                <td className="p-2 border">{cat.count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseReport;
