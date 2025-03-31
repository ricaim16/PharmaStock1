import { useState, useEffect, useCallback } from "react";
import { getAllCustomers, getCreditReport } from "../api/customerApi.js";
import { jwtDecode } from "jwt-decode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CreditReport = () => {
  const [credits, setCredits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [report, setReport] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    start_date: "",
    end_date: "",
    limit: 100,
    offset: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const formatEAT = useCallback((date) => {
    return new Date(date).toLocaleString("en-US", {
      timeZone: "Africa/Addis_Ababa",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

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
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCreditReport();
    }
  }, [selectedCustomerId]); // Removed displayLimit dependency

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCustomers();
      setCustomers(data || []);
      if (data && data.length > 0) {
        setSelectedCustomerId(data[0].id);
      }
    } catch (err) {
      setError("Failed to fetch customers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const reportData = await getCreditReport({
        ...reportFilters,
        customer_id: selectedCustomerId || undefined,
      });
      setReport(reportData);
      const fetchedCredits = reportData.credits || [];
      setCredits(fetchedCredits);
    } catch (err) {
      setError("Failed to fetch credit report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters((prev) => ({
      ...prev,
      [name]: value,
      offset: name === "limit" ? 0 : prev.offset,
    }));
  };

  const handleCustomerChange = (e) => {
    setSelectedCustomerId(e.target.value);
    setReport(null);
    setCredits([]);
  };

  const handlePageChange = (direction) => {
    setReportFilters((prev) => ({
      ...prev,
      offset:
        direction === "next"
          ? prev.offset + prev.limit
          : Math.max(0, prev.offset - prev.limit),
    }));
    fetchCreditReport();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(16);
    doc.text("Customer Credit Report", pageWidth / 2, y, { align: "center" });
    y += 10;

    // Subtitle
    doc.setFontSize(12);
    const customerName = selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)?.name || "Unknown"
      : "All Customers";
    const dateRange =
      reportFilters.start_date && reportFilters.end_date
        ? `${reportFilters.start_date} to ${reportFilters.end_date}`
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

    // Credit Status
    doc.setFontSize(14);
    doc.text("Credit Status", 14, y);
    y += 10;
    autoTable(doc, {
      startY: y,
      head: [
        [
          "Customer Name",
          "Total Credit",
          "Paid Amount",
          "Unpaid Amount",
          "Status",
        ],
      ],
      body: credits.map((cred) => [
        cred.customer?.name || "N/A",
        parseFloat(cred.credit_amount || 0).toFixed(2),
        parseFloat(cred.paid_amount || 0).toFixed(2),
        parseFloat(cred.unpaid_amount || 0).toFixed(2),
        cred.status || "N/A",
      ]),
      theme: "grid",
      headStyles: { fillColor: [0, 128, 128] },
    });

    doc.save(
      `Customer_Credit_Report_${formatEAT(new Date()).replace(
        /[:,\s]/g,
        "_"
      )}.pdf`
    );
  };

  const totalCreditAmount = credits.reduce(
    (sum, cred) => sum + (parseFloat(cred.credit_amount) || 0),
    0
  );
  const totalPaidAmount = credits.reduce(
    (sum, cred) => sum + (parseFloat(cred.paid_amount) || 0),
    0
  );
  const totalUnpaidAmount = credits.reduce(
    (sum, cred) => sum + (parseFloat(cred.unpaid_amount) || 0),
    0
  );

  const filteredCustomers = customers.filter((customer) =>
    customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Customer Credit Report
      </h2>

      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchCreditReport}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Customer by Name
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full sm:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <select
            value={selectedCustomerId}
            onChange={handleCustomerChange}
            className="w-full sm:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading || customers.length === 0}
          >
            <option value="">All Customers</option>
            {filteredCustomers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Generate Credit Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={reportFilters.start_date}
              onChange={handleReportFilterChange}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={reportFilters.end_date}
              onChange={handleReportFilterChange}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Items per Page
            </label>
            <select
              name="limit"
              value={reportFilters.limit}
              onChange={handleReportFilterChange}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchCreditReport}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {!loading && !error && credits.length === 0 && (
        <div className="text-center text-gray-600 mb-4">
          No credit report generated yet. Please select a customer and click
          "Generate Report".
        </div>
      )}

      {credits.length > 0 && (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              Download Report as PDF
            </button>
          </div>

          <div id="printable-report">
            <h3 className="text-lg font-semibold mb-2">Credit Status</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Customer Name</th>
                    <th className="border p-2">Total Credit</th>
                    <th className="border p-2">Paid Amount</th>
                    <th className="border p-2">Unpaid Amount</th>
                    <th className="border p-2">Status</th>
                    {userRole === "MANAGER" && (
                      <th className="border p-2">Created By</th>
                    )}
                    {userRole === "MANAGER" && (
                      <th className="border p-2">Updated By</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {credits.map((cred) => (
                    <tr key={cred.id}>
                      <td className="border p-2">
                        {cred.customer?.name || "N/A"}
                      </td>
                      <td className="border p-2">
                        {parseFloat(cred.credit_amount || 0).toFixed(2)}
                      </td>
                      <td className="border p-2">
                        {parseFloat(cred.paid_amount || 0).toFixed(2)}
                      </td>
                      <td className="border p-2">
                        {parseFloat(cred.unpaid_amount || 0).toFixed(2)}
                      </td>
                      <td
                        className={`border p-2 ${
                          cred.status === "UNPAID"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {cred.status || "N/A"}
                      </td>
                      {userRole === "MANAGER" && (
                        <td className="border p-2">
                          {cred.createdBy?.username || "N/A"}
                        </td>
                      )}
                      {userRole === "MANAGER" && (
                        <td className="border p-2">
                          {cred.updatedBy?.username || "N/A"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border p-2">Total</td>
                    <td className="border p-2">
                      {totalCreditAmount.toFixed(2)}
                    </td>
                    <td className="border p-2">{totalPaidAmount.toFixed(2)}</td>
                    <td className="border p-2">
                      {totalUnpaidAmount.toFixed(2)}
                    </td>
                    <td
                      colSpan={userRole === "MANAGER" ? 3 : 1}
                      className="border p-2"
                    ></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {report && (
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handlePageChange("prev")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
                disabled={loading || report.summary.page === 1}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange("next")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
                disabled={
                  loading || report.summary.page === report.summary.totalPages
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreditReport;
