import React, { useState, useEffect } from "react";
import returnsApi from "../api/returnsApi";
import ReturnsForm from "./ReturnsForm";

const ReturnsList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const data = await returnsApi.getAllReturns();
      setReturns(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Error fetching returns");
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedReturn(null);
    setShowForm(true);
  };

  const handleEdit = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this return?")) {
      try {
        await returnsApi.deleteReturn(id);
        setReturns(returns.filter((r) => r.id !== id));
      } catch (err) {
        setError(err.message || "Error deleting return");
      }
    }
  };

  const handleSave = () => {
    setShowForm(false);
    fetchReturns();
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "N/A";
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Returns</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Return
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left text-sm font-semibold text-gray-700">
                Product Name
              </th>
              <th className="border p-2 text-left text-sm font-semibold text-gray-700">
                Batch Number
              </th>
              <th className="border p-2 text-left text-sm font-semibold text-gray-700">
                Medicine
              </th>
              <th className="border p-2 text-left text-sm font-semibold text-gray-700">
                Dosage Form
              </th>
              <th className="border p-2 text-left text-sm font-semibold text-gray-700">
                Quantity
              </th>
              <th className="border p-2 text-left text-sm font-semibold text-gray-700">
                Reason
              </th>
              <th className="border p-2 text-left text-sm font-semibold text-gray-700">
                Return Date
              </th>
              <th className="border p-2 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {returns.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="border p-2 text-center text-gray-500"
                >
                  No returns found.
                </td>
              </tr>
            ) : (
              returns.map((returnItem) => (
                <tr key={returnItem.id} className="hover:bg-gray-100">
                  <td className="border p-2">
                    {returnItem.product_name || "N/A"}
                  </td>
                  <td className="border p-2">
                    {returnItem.product_batch_number || "N/A"}
                  </td>
                  <td className="border p-2">
                    {returnItem.medicine?.medicine_name || "N/A"}
                  </td>
                  <td className="border p-2">
                    {returnItem.dosage_form?.name || "N/A"}
                  </td>
                  <td className="border p-2">{returnItem.quantity || "N/A"}</td>
                  <td className="border p-2">
                    {returnItem.reason_for_return || "N/A"}
                  </td>
                  <td className="border p-2">
                    {formatDate(returnItem.return_date)}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(returnItem)}
                      className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(returnItem.id)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <ReturnsForm
          returnData={selectedReturn}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ReturnsList;
