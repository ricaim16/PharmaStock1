import { useState, useEffect } from "react";
import {
  getAllMedicines,
  deleteMedicine,
  getLowStockMedicines,
} from "../api/medicineApi";
import MedicineForm from "../components/MedicineForm";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [error, setError] = useState(null);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const formatEAT = (date) => {
    const options = {
      timeZone: "Africa/Addis_Ababa", // EAT (UTC+3)
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Use AM/PM format
    };
    return new Date(date).toLocaleString("en-US", options);
  };

  const getCurrentEAT = () => {
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
      )
    );
    const etOffset = 3 * 60 * 60 * 1000; // UTC+3 for East Africa Time
    return new Date(utcDate.getTime() + etOffset);
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
    fetchMedicines();
    fetchLowStockMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await getAllMedicines();
      // Sort the medicines by updatedAt in descending order (most recent first)
      const sortedData = [...data].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setMedicines(sortedData);
      const now = getCurrentEAT();
      const expiring = sortedData.filter((med) => {
        const expiry = new Date(med.expire_date);
        const monthsDiff = (expiry - now) / (1000 * 60 * 60 * 24 * 30);
        return monthsDiff <= 6;
      });
      setExpiringMedicines(expiring);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch medicines: " +
          (err.response?.data?.error?.message || err.message)
      );
    }
  };

  const fetchLowStockMedicines = async () => {
    setLoadingLowStock(true);
    setError(null);
    try {
      const data = await getLowStockMedicines();
      setLowStockMedicines(data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "Low stock endpoint not found on server. Please check the backend."
          : `Failed to fetch low stock medicines: ${
              err.response?.data?.error?.message || err.message
            }`
      );
    } finally {
      setLoadingLowStock(false);
    }
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setIsFormOpen(true);
  };

  const handleView = (medicine) => {
    setSelectedMedicine(medicine);
    setIsViewOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteMedicine(id);
        setMedicines(medicines.filter((med) => med.id !== id));
        setLowStockMedicines(lowStockMedicines.filter((med) => med.id !== id));
        setExpiringMedicines(expiringMedicines.filter((med) => med.id !== id));
        // Refresh the list from the backend after deletion
        fetchMedicines();
        fetchLowStockMedicines();
      } catch (err) {
        setError(
          "Failed to delete medicine: " +
            (err.response?.data?.error?.message || err.message)
        );
      }
    }
  };

  const handleSave = (newMedicine) => {
    setMedicines((prev) => {
      if (selectedMedicine) {
        const updatedList = prev.filter((med) => med.id !== newMedicine.id);
        return [newMedicine, ...updatedList];
      }
      return [newMedicine, ...prev];
    });
    setIsFormOpen(false);
    setSelectedMedicine(null);
    // Update low stock and expiring medicines locally
    setLowStockMedicines((prev) => {
      if (newMedicine.quantity <= 10) {
        if (selectedMedicine) {
          return prev.some((med) => med.id === newMedicine.id)
            ? prev.map((med) => (med.id === newMedicine.id ? newMedicine : med))
            : [...prev, newMedicine];
        }
        return [...prev, newMedicine];
      }
      return prev.filter((med) => med.id !== newMedicine.id);
    });
    setExpiringMedicines((prev) => {
      const now = getCurrentEAT();
      const expiry = new Date(newMedicine.expire_date);
      const monthsDiff = (expiry - now) / (1000 * 60 * 60 * 24 * 30);
      if (monthsDiff <= 6) {
        if (selectedMedicine) {
          return prev.some((med) => med.id === newMedicine.id)
            ? prev.map((med) => (med.id === newMedicine.id ? newMedicine : med))
            : [...prev, newMedicine];
        }
        return [...prev, newMedicine];
      }
      return prev.filter((med) => med.id !== newMedicine.id);
    });
  };

  const handleAddMedicine = () => {
    setSelectedMedicine(null);
    setIsFormOpen(true);
  };

  const isLowStock = (medicineId) =>
    lowStockMedicines.some((med) => med.id === medicineId);

  const getExpiryStatus = (expireDate) => {
    const now = getCurrentEAT();
    const expiry = new Date(expireDate);
    const monthsDiff = (expiry - now) / (1000 * 60 * 60 * 24 * 30);
    if (monthsDiff <= 3) return "red"; // Red for ≤ 3 months
    if (monthsDiff <= 6) return "yellow"; // Yellow for ≤ 6 months but > 3 months
    return "green"; // Green for > 6 months
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Medicines</h2>
      {error && (
        <div className="text-red-500 mb-4">
          {error}
          {error.includes("endpoint not found") && (
            <button
              onClick={fetchLowStockMedicines}
              className="ml-4 bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Buttons for Adding Medicine and Generating Report */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleAddMedicine}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Add Medicine
        </button>
        <Link
          to="/inventory-management/report"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Generate Report
        </Link>
      </div>

      {/* Medicine Form (Appears When Adding or Editing) */}
      {isFormOpen && (
        <MedicineForm
          medicine={selectedMedicine}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {/* View Medicine Modal */}
      {isViewOpen && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Medicine Details</h3>
            <p>
              <strong>Invoice Number:</strong> {selectedMedicine.invoice_number}
            </p>
            <p>
              <strong>Medicine Name:</strong> {selectedMedicine.medicine_name}
            </p>
            <p>
              <strong>Brand:</strong> {selectedMedicine.brand_name || "N/A"}
            </p>
            <p>
              <strong>Batch Number:</strong>{" "}
              {selectedMedicine.batch_number || "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {selectedMedicine.category.name}
            </p>
            <p>
              <strong>Dosage Form:</strong> {selectedMedicine.dosage_form.name}
            </p>
            <p>
              <strong>Weight:</strong>{" "}
              {selectedMedicine.medicine_weight || "N/A"}
            </p>
            <p>
              <strong>Quantity:</strong> {selectedMedicine.quantity}
            </p>
            <p>
              <strong>Supplier:</strong>{" "}
              {selectedMedicine.supplier.supplier_name}
            </p>
            <p>
              <strong>Unit Price:</strong> {selectedMedicine.unit_price}
            </p>
            <p>
              <strong>Sell Price:</strong>{" "}
              {selectedMedicine.sell_price || "N/A"}
            </p>
            <p>
              <strong>Total Price:</strong> {selectedMedicine.total_price}
            </p>
            <p>
              <strong>Expire Date:</strong>{" "}
              {formatEAT(selectedMedicine.expire_date)}
            </p>
            <p>
              <strong>Requires Prescription:</strong>{" "}
              {selectedMedicine.required_prescription ? "Yes" : "No"}
            </p>
            <p>
              <strong>Payment Method:</strong> {selectedMedicine.payment_method}
            </p>
            {selectedMedicine.Payment_file && (
              <p>
                <strong>Payment File:</strong>{" "}
                <a
                  href={`http://localhost:5000/${selectedMedicine.Payment_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              </p>
            )}
            <p>
              <strong>Details:</strong> {selectedMedicine.details || "N/A"}
            </p>
            {userRole === "MANAGER" && (
              <>
                <p>
                  <strong>Created By:</strong>{" "}
                  {selectedMedicine.createdBy.username}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {formatEAT(selectedMedicine.createdAt)}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {formatEAT(selectedMedicine.updatedAt)}
                </p>
              </>
            )}
            <button
              onClick={() => setIsViewOpen(false)}
              className="mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Table (Medicine List) */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Invoice</th>
              <th className="border p-2">Medicine Name</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Dosage</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Supplier</th>
              <th className="border p-2">Unit</th>
              <th className="border p-2">Sell</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Expiry</th>
              {userRole === "MANAGER" && (
                <>
                  <th className="border p-2">Created By</th>
                  <th className="border p-2">Created At</th>
                  <th className="border p-2">Updated At</th>
                </>
              )}
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => {
              const expiryStatus = getExpiryStatus(med.expire_date);
              return (
                <tr
                  key={med.id}
                  className={`${
                    expiryStatus === "red"
                      ? "bg-red-100"
                      : expiryStatus === "yellow"
                      ? "bg-yellow-100"
                      : isLowStock(med.id)
                      ? "bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <td className="border p-2">{med.invoice_number}</td>
                  <td className="border p-2">{med.medicine_name}</td>
                  <td className="border p-2">{med.brand_name || "N/A"}</td>
                  <td className="border p-2">{med.category.name}</td>
                  <td className="border p-2">{med.dosage_form.name}</td>
                  <td className="border p-2">{med.quantity}</td>
                  <td className="border p-2">{med.supplier.supplier_name}</td>
                  <td className="border p-2">{med.unit_price}</td>
                  <td className="border p-2">{med.sell_price || "N/A"}</td>
                  <td className="border p-2">{med.total_price}</td>
                  <td
                    className={`border p-2 ${
                      expiryStatus === "red"
                        ? "text-red-600"
                        : expiryStatus === "yellow"
                        ? "text-yellow-600"
                        : "text-black"
                    }`}
                  >
                    {formatEAT(med.expire_date)}
                  </td>
                  {userRole === "MANAGER" && (
                    <>
                      <td className="border p-2">{med.createdBy.username}</td>
                      <td className="border p-2">{formatEAT(med.createdAt)}</td>
                      <td className="border p-2">{formatEAT(med.updatedAt)}</td>
                    </>
                  )}
                  <td className="border p-2">
                    <button
                      onClick={() => handleView(med)}
                      className="bg-blue-500 text-white p-1 rounded mr-2 hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(med)}
                      className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Alerts (Low Stock and Expiration) */}
      {loadingLowStock && (
        <div className="mt-4">Loading low stock medicines...</div>
      )}
      {lowStockMedicines.length > 0 && !loadingLowStock && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-400 rounded">
          <h3 className="text-lg font-semibold text-gray-800">
            Low Stock Alert
          </h3>
          <p className="text-gray-700">
            The following medicines are below the stock threshold (10 units):
          </p>
          <ul className="list-disc pl-5">
            {lowStockMedicines.map((med) => (
              <li key={med.id}>
                {med.medicine_name} - Quantity: {med.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
      {expiringMedicines.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <h3 className="text-lg font-semibold text-yellow-800">
            Expiration Alert
          </h3>
          <p className="text-yellow-700">
            The following medicines are nearing their expiration date:
          </p>
          <ul className="list-disc pl-5">
            {expiringMedicines.map((med) => {
              const monthsLeft = Math.round(
                (new Date(med.expire_date) - getCurrentEAT()) /
                  (1000 * 60 * 60 * 24 * 30)
              );
              const alertClass =
                monthsLeft <= 3 ? "text-red-600" : "text-yellow-600";
              return (
                <li key={med.id} className={alertClass}>
                  {med.medicine_name} - Expires: {formatEAT(med.expire_date)} (
                  {monthsLeft} months left)
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Medicines;
