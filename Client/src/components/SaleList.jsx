import { useState, useEffect } from "react";
import { getAllSales, deleteSale } from "../api/salesApi";
import SaleForm from "./SaleForm";
import { jwtDecode } from "jwt-decode";

const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const formatEAT = (date) => {
    const options = {
      timeZone: "Africa/Addis_Ababa",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(date).toLocaleString("en-US", options);
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
      console.log("Decoded token:", decoded); // Log token details
    } catch (err) {
      setError("Invalid token format. Please log in again.");
      return;
    }
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const data = await getAllSales();
      console.log("Fetched sales:", JSON.stringify(data, null, 2)); // Detailed log
      setSales(
        data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)) // Sort by updated_at instead
      );
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch sales: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEdit = (sale) => {
    setSelectedSale(sale);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await deleteSale(id);
        setSales(sales.filter((sale) => sale.id !== id));
        setError(null);
      } catch (err) {
        setError(
          "Failed to delete sale: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleSave = (newSale) => {
    console.log("Saved sale:", JSON.stringify(newSale, null, 2)); // Detailed log
    setSales((prev) =>
      selectedSale
        ? prev.map((sale) => (sale.id === newSale.id ? newSale : sale))
        : [newSale, ...prev]
    );
    setIsFormOpen(false);
    setSelectedSale(null);
    fetchSales(); // Refresh the list
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Sales</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600"
      >
        Add Sale
      </button>
      {isFormOpen && (
        <SaleForm
          sale={selectedSale}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
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
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-100">
                <td className="border p-2">{sale.customer?.name || "N/A"}</td>
                <td className="border p-2">
                  {sale.medicine?.medicine_name || "Unknown"}
                </td>
                <td className="border p-2">
                  {sale.dosage_form?.name || "N/A"}
                </td>
                <td className="border p-2">{sale.quantity || 0}</td>
                <td className="border p-2">{sale.price || 0}</td>
                <td className="border p-2">{sale.total_amount || 0}</td>
                <td className="border p-2">{sale.payment_method || "N/A"}</td>
                <td className="border p-2">
                  {sale.prescription ? "Yes" : "No"}
                </td>
                <td className="border p-2">{sale.product_name || "N/A"}</td>
                <td className="border p-2">
                  {sale.product_batch_number || "N/A"}
                </td>
                <td className="border p-2">{formatEAT(sale.created_at)}</td>
                <td className="border p-2">{formatEAT(sale.updated_at)}</td>
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
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id)}
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
    </div>
  );
};

export default SaleList;
