import React, { useEffect, useState } from "react";
import { expenseApi } from "../api/expenseApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";

const ExpenseReport = () => {
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Format date to East Africa Time (EAT)
  const formatEAT = (date) => {
    try {
      return new Date(date).toLocaleString("en-US", {
        timeZone: "Africa/Addis_Ababa",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  // Fetch user role from JWT on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role.toUpperCase());
    } catch (err) {
      setError("Invalid token format. Please log in again.");
      return;
    }
    fetchReport();
  }, []);

  // Fetch expense report with filters
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      console.log("Fetching expense report with filters:", cleanedFilters);
      const data = await expenseApi.getExpenseReport(cleanedFilters);
      console.log("Expense report data received:", data);
      if (
        !data ||
        !data.totalExpenses ||
        !Array.isArray(data.expensesByCategory)
      ) {
        throw new Error("Invalid report data structure");
      }
      setReport(data);
    } catch (err) {
      console.error("Fetch expense report error:", err);
      setError(
        "Failed to fetch report: " +
          (err.response?.data?.message || err.message || "Unknown error")
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle filter form submission
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  // Download report as PDF
  const downloadReport = () => {
    if (!report || !Array.isArray(report.expensesByCategory)) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(16);
    doc.text("Expense Report", pageWidth / 2, y, { align: "center" });
    y += 10;

    // Metadata
    doc.setFontSize(12);
    const dateRange =
      filters.start_date && filters.end_date
        ? `${filters.start_date} to ${filters.end_date}`
        : "All Dates";
    doc.text(
      `Date Range: ${dateRange} | Generated: ${formatEAT(new Date())}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 15;

    // Summary
    doc.setFontSize(14);
    doc.text("Expense Summary", 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total Expenses: ETB ${report.totalExpenses || 0}`, 14, y);
    y += 10;

    // Detailed Expenses by Category
    doc.setFontSize(14);
    doc.text("Expenses by Category", 14, y);
    y += 10;

    const tableHeaders = ["Category", "Total Amount", "Count"];

    const tableData = report.expensesByCategory.map((cat) => [
      cat.category || "Unknown",
      cat.total || 0,
      cat.count || 0,
    ]);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [0, 128, 128] },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    doc.save(
      `Expense_Report_${formatEAT(new Date()).replace(/[:,\s]/g, "_")}.pdf`
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Expense Report</h2>
      <form onSubmit={handleFilterSubmit} className="mb-4 space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
          <button
            onClick={fetchReport}
            className="ml-4 bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {loading && <div className="text-gray-500">Loading report...</div>}

      {report && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Summary</h3>
            <p>Total Expenses: ETB {report.totalExpenses || 0}</p>
          </div>
          {report.expensesByCategory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Total Amount</th>
                    <th className="border p-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expensesByCategory.map((cat, index) => (
                    <tr
                      key={cat.category || index}
                      className="hover:bg-gray-100"
                    >
                      <td className="border p-2">
                        {cat.category || "Unknown"}
                      </td>
                      <td className="border p-2">{cat.total || 0}</td>
                      <td className="border p-2">{cat.count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">
              {report.message || "No expenses found"}
            </div>
          )}
          <button
            onClick={downloadReport}
            className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={
              !report || report.expensesByCategory.length === 0 || loading
            }
          >
            Download Report as PDF
          </button>
        </>
      )}

      {!report && !error && !loading && (
        <div className="text-gray-500">
          No report data available. Try applying filters.
        </div>
      )}
    </div>
  );
};

export default ExpenseReport;
