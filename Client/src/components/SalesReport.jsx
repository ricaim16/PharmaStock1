import { useState, useEffect } from "react";
import { generateSalesReport } from "../api/salesApi";
import { getAllCustomers } from "../api/customerApi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    customer_id: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);

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
    fetchCustomers();
    fetchReport();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data || []);
    } catch (err) {
      setError("Failed to load customers: " + (err.message || "Unknown error"));
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      console.log("Fetching report with filters:", cleanedFilters);
      const data = await generateSalesReport(cleanedFilters);
      console.log("Report data received:", data.sales); // Debug
      if (!data || !data.summary || !Array.isArray(data.sales)) {
        throw new Error("Invalid report data structure");
      }
      setReport(data);
    } catch (err) {
      console.error("Fetch report error:", err);
      setError(
        "Failed to fetch report: " +
          (err.response?.data?.message || err.message || "Unknown error")
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const downloadReport = () => {
    if (!report || !Array.isArray(report.sales)) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16);
    doc.text("Sales Report", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(12);
    const customerName = filters.customer_id
      ? customers.find((c) => c.id === filters.customer_id)?.name || "Unknown"
      : "All Customers";
    const dateRange =
      filters.start_date && filters.end_date
        ? `${filters.start_date} to ${filters.end_date}`
        : "All Dates";
    doc.text(
      `Customer: ${customerName} | Date Range: ${dateRange} | Generated: ${formatEAT(
        new Date()
      )}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 15;

    doc.setFontSize(14);
    doc.text("Sales Summary", 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Sales Count: ${report.summary.salesCount || 0}`, 14, y);
    y += 6;
    doc.text(`Total Sales: ETB ${report.summary.totalSales || 0}`, 14, y);
    y += 6;
    doc.text(`Total Quantity: ${report.summary.totalQuantity || 0}`, 14, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("Sales Details", 14, y);
    y += 10;

    const tableData = report.sales.map((sale) => {
      const row = [
        sale.customer?.name || "N/A",
        sale.medicine?.medicine_name || "Unknown",
        sale.dosage_form?.name || "N/A",
        sale.quantity || 0,
        sale.price || 0,
        sale.total_amount || 0,
        sale.payment_method || "N/A",
        sale.prescription ? "Yes" : "No",
        sale.product_name || "N/A",
        sale.product_batch_number || "N/A",
        formatEAT(sale.created_at),
        formatEAT(sale.updated_at),
      ];
      if (userRole === "MANAGER") {
        row.push(sale.createdBy?.username || "N/A");
        row.push(sale.updatedBy?.username || "N/A");
      }
      return row;
    });

    const tableHeaders = [
      "Customer",
      "Medicine",
      "Dosage Form",
      "Quantity",
      "Price",
      "Total",
      "Payment",
      "Prescription",
      "Product Name",
      "Batch No",
      "Created At",
      "Updated At",
    ];
    if (userRole === "MANAGER") {
      tableHeaders.push("Created By", "Updated By");
    }

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [0, 128, 128] },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    doc.save(
      `Sales_Report_${formatEAT(new Date()).replace(/[:,\s]/g, "_")}.pdf`
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Sales Report</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <select
              name="customer_id"
              value={filters.customer_id}
              onChange={handleFilterChange}
              className="p-2 border rounded w-full"
            >
              <option value="">All Customers</option>
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name}
                </option>
              ))}
            </select>
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
            <p>Sales Count: {report.summary.salesCount || 0}</p>
            <p>Total Sales: ETB {report.summary.totalSales || 0}</p>
            <p>Total Quantity: {report.summary.totalQuantity || 0}</p>
          </div>
          {report.sales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Customer</th>
                    <th className="border p-2">Medicine</th>
                    <th className="border p-2">Dosage Form</th>
                    <th className="border p-2">Quantity</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Total Amount</th>
                    <th className="border p-2">Payment</th>
                    <th className="border p-2">Prescription</th>
                    <th className="border p-2">Product Name</th>
                    <th className="border p-2">Batch No</th>
                    <th className="border p-2">Created At</th>
                    <th className="border p-2">Updated At</th>
                    {userRole === "MANAGER" && (
                      <th className="border p-2">Created By</th>
                    )}
                    {userRole === "MANAGER" && (
                      <th className="border p-2">Updated By</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {report.sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-100">
                      <td className="border p-2">
                        {sale.customer?.name || "N/A"}
                      </td>
                      <td className="border p-2">
                        {sale.medicine?.medicine_name || "Unknown"}
                      </td>
                      <td className="border p-2">
                        {sale.dosage_form?.name || "N/A"}
                      </td>
                      <td className="border p-2">{sale.quantity || 0}</td>
                      <td className="border p-2">{sale.price || 0}</td>
                      <td className="border p-2">{sale.total_amount || 0}</td>
                      <td className="border p-2">
                        {sale.payment_method || "N/A"}
                      </td>
                      <td className="border p-2">
                        {sale.prescription ? "Yes" : "No"}
                      </td>
                      <td className="border p-2">
                        {sale.product_name || "N/A"}
                      </td>
                      <td className="border p-2">
                        {sale.product_batch_number || "N/A"}
                      </td>
                      <td className="border p-2">
                        {formatEAT(sale.created_at)}
                      </td>
                      <td className="border p-2">
                        {formatEAT(sale.updated_at)}
                      </td>
                      {userRole === "MANAGER" && (
                        <td className="border p-2">
                          {sale.createdBy?.username || "N/A"}
                        </td>
                      )}
                      {userRole === "MANAGER" && (
                        <td className="border p-2">
                          {sale.updatedBy?.username || "N/A"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">
              {report.message || "No sales found"}
            </div>
          )}
          <button
            onClick={downloadReport}
            className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!report || report.sales.length === 0 || loading}
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

export default SalesReport;
