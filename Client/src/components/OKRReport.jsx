// src/components/OKRReport.jsx
import React, { useState } from "react";
import { generateOKRReport } from "../api/okrApi";

const OKRReport = () => {
  const [reportDateRange, setReportDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await generateOKRReport(
        reportDateRange.startDate,
        reportDateRange.endDate
      );
      setReport(response.data.data);
    } catch (err) {
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Generate OKR Report</h2>
      <form onSubmit={handleGenerateReport} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={reportDateRange.startDate}
              onChange={(e) =>
                setReportDateRange({
                  ...reportDateRange,
                  startDate: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={reportDateRange.endDate}
              onChange={(e) =>
                setReportDateRange({
                  ...reportDateRange,
                  endDate: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {report && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Report Results</h3>
          <div className="space-y-4">
            {report.map((item, index) => (
              <div key={index} className="border-b pb-4">
                <h4 className="font-medium">{item.objective.title}</h4>
                <p className="text-sm text-gray-600">
                  Overall Progress: {item.overallProgress.toFixed(2)}%
                </p>
                {item.keyResults.length > 0 && (
                  <ul className="list-disc pl-5 mt-2">
                    {item.keyResults.map((kr) => (
                      <li key={kr.id} className="text-sm text-gray-600">
                        {kr.title} - Progress: {kr.progress}% (Weight:{" "}
                        {kr.weight})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OKRReport;


