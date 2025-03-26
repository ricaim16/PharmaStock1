import { useState, useEffect } from "react";
import { getAllMedicines, deleteMedicine } from "../api/medicineApi";
import MedicineForm from "./MedicineForm";

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);

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

  const getExpiryStatus = (expireDate) => {
    const now = getCurrentEAT();
    const expiry = new Date(expireDate);
    const monthsDiff = (expiry - now) / (1000 * 60 * 60 * 24 * 30);
    if (monthsDiff <= 3) return "red"; // Red for ≤ 3 months
    if (monthsDiff <= 6) return "yellow"; // Yellow for ≤ 6 months
    return "green"; // Green for > 6 months
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await getAllMedicines();
      setMedicines(data);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch medicines: " +
          (err.response?.data?.error?.message || err.message)
      );
    }
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteMedicine(id);
        setMedicines(medicines.filter((med) => med.id !== id));
        setError(null);
      } catch (err) {
        setError(
          "Failed to delete medicine: " +
            (err.response?.data?.error?.message || err.message)
        );
      }
    }
  };

  const handleSave = (newMedicine) => {
    setMedicines((prev) =>
      selectedMedicine
        ? prev.map((med) => (med.id === newMedicine.id ? newMedicine : med))
        : [...prev, newMedicine]
    );
    setIsFormOpen(false);
    setSelectedMedicine(null);
    fetchMedicines(); // Refresh to ensure consistency with backend
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Medicines</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600"
      >
        Add Medicine
      </button>
      {isFormOpen && (
        <MedicineForm
          medicine={selectedMedicine}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Brand</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2">Expiry</th>
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
                    : "hover:bg-gray-100"
                }`}
              >
                <td className="border p-2">{med.medicine_name}</td>
                <td className="border p-2">{med.brand_name || "N/A"}</td>
                <td className="border p-2">{med.quantity}</td>
                <td className="border p-2">{med.supplier.supplier_name}</td>
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
                <td className="border p-2">
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
  );
};

export default MedicineList;
