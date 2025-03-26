import { useState, useEffect } from "react";
import { generateMedicineReport } from "../api/medicineApi";
import { jsPDF } from "jspdf";

const MedicineReport = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatEAT = (date) => {
    const options = {
      timeZone: "Africa/Addis_Ababa", // EAT (UTC+3)
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Use AM/PM format as requested
    };
    return new Date(date).toLocaleString("en-US", options);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateMedicineReport();
      setReport(data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "Report endpoint not found on server. Please check the backend."
          : `Failed to fetch medicine report: ${
              err.response?.data?.error?.message || err.message
            }`
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const doc = new jsPDF();
    doc.setFontSize(12);

    doc.text("Medicine Report", 10, 10);
    doc.text(`Generated At: ${formatEAT(report.generatedAt)}`, 10, 20);

    doc.text("Winning Products (Top Sellers):", 10, 30);
    let y = 40;
    report.winningProducts.forEach((med) => {
      doc.text(`${med.medicine_name} - Sales: ${med.totalSales}`, 10, y);
      y += 10;
    });

    doc.text("Worst-Performing Products (Low Sellers):", 10, y + 10);
    y += 20;
    report.worstPerformingProducts.forEach((med) => {
      doc.text(`${med.medicine_name} - Sales: ${med.totalSales}`, 10, y);
      y += 10;
    });

    doc.text("Stock Levels:", 10, y + 10);
    y += 20;
    report.stockLevels.forEach((med) => {
      doc.text(
        `${med.medicine_name} - Quantity: ${med.quantity} - Expiry: ${formatEAT(
          med.expire_date
        )} - Created By: ${med.createdBy}`,
        10,
        y
      );
      y += 10;
    });

    doc.save(`Medicine_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return <div className="p-4">Loading report...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Medicine Report</h2>
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
          <p className="mb-4">Generated At: {formatEAT(report.generatedAt)}</p>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Winning Products (Top Sellers)
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Medicine Name</th>
                  <th className="border p-2">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {report.winningProducts.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-100">
                    <td className="border p-2">{med.medicine_name}</td>
                    <td className="border p-2">{med.totalSales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Worst-Performing Products (Low Sellers)
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Medicine Name</th>
                  <th className="border p-2">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {report.worstPerformingProducts.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-100">
                    <td className="border p-2">{med.medicine_name}</td>
                    <td className="border p-2">{med.totalSales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Stock Levels</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Medicine Name</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Expiry</th>
                  <th className="border p-2">Created By</th>
                </tr>
              </thead>
              <tbody>
                {report.stockLevels.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-100">
                    <td className="border p-2">{med.medicine_name}</td>
                    <td className="border p-2">{med.quantity}</td>
                    <td className="border p-2">{formatEAT(med.expire_date)}</td>
                    <td className="border p-2">{med.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={downloadReport}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Download Report as PDF
          </button>
        </>
      )}
    </div>
  );
};

export default MedicineReport;
