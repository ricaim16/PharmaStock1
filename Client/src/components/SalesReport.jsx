import { useState, useEffect } from "react";
import { generateSalesReport } from "../api/salesApi";
import { getAllCustomers } from "../api/customerApi";
import { jsPDF } from "jspdf";

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

  const formatEAT = (date) => {
    return new Date(date).toLocaleString("en-US", {
      timeZone: "Africa/Addis_Ababa",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    fetchCustomers();
    fetchReport();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError("Failed to load customers");
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanedFilters = {
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        customer_id: filters.customer_id || undefined,
      };
      const data = await generateSalesReport(cleanedFilters);
      setReport(data);
    } catch (err) {
      setError(err.message);
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
    if (!report) return;

    const doc = new jsPDF();
    doc.setFontSize(12);

    doc.text("Sales Report", 10, 10);
    doc.text(`Generated At: ${formatEAT(new Date())}`, 10, 20);
    doc.text(`Sales Count: ${report.summary.salesCount}`, 10, 30);
    doc.text(`Total Sales: ${report.summary.totalSales}`, 10, 40);
    doc.text(`Total Quantity: ${report.summary.totalQuantity}`, 10, 50);

    let y = 60;
    report.sales.forEach((sale, index) => {
      const line = `${index + 1}. ${sale.medicine.medicine_name} - ${
        sale.customer.name
      } - Qty: ${sale.quantity} - Price: ${sale.price} - Total: ${
        sale.total_amount
      } - ${sale.payment_method} - ${formatEAT(sale.sealed_date)}`;
      doc.text(line, 10, y, { maxWidth: 180 });
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save(`Sales_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return <div className="p-4">Loading report...</div>;

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
              className="p-2 border rounded"
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
              className="p-2 border rounded"
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
              className="p-2 border rounded"
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
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Apply Filters
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
      {report && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Summary</h3>
            <p>Sales Count: {report.summary.salesCount}</p>
            <p>Total Sales: {report.summary.totalSales}</p>
            <p>Total Quantity: {report.summary.totalQuantity}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Medicine</th>
                  <th className="border p-2">Customer</th>
                  <th className="border p-2">Dosage Form</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Total Amount</th>
                  <th className="border p-2">Payment</th>
                  <th className="border p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {report.sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-100">
                    <td className="border p-2">
                      {sale.medicine.medicine_name}
                    </td>
                    <td className="border p-2">{sale.customer.name}</td>
                    <td className="border p-2">{sale.dosage_form.name}</td>
                    <td className="border p-2">{sale.quantity}</td>
                    <td className="border p-2">{sale.price}</td>
                    <td className="border p-2">{sale.total_amount}</td>
                    <td className="border p-2">{sale.payment_method}</td>
                    <td className="border p-2">
                      {formatEAT(sale.sealed_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={downloadReport}
            className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Download Report as PDF
          </button>
        </>
      )}
    </div>
  );
};

export default SalesReport;
