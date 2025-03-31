import { useState, useEffect } from "react";
import { getAllSuppliers, deleteSupplier } from "../api/supplierApi";
import SupplierForm from "./SupplierForm";
import { Link } from "react-router-dom";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      const supplierArray = Array.isArray(data) ? data : [];
      setSuppliers(
        supplierArray.sort((a, b) =>
          a.supplier_name.localeCompare(b.supplier_name)
        )
      );
      setError(null);
    } catch (err) {
      console.error("Fetch Suppliers Error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || "Failed to fetch suppliers");
      setSuppliers([]);
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id);
        setSuppliers(suppliers.filter((supp) => supp.id !== id));
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete supplier");
      }
    }
  };

  const handleSave = (newSupplier) => {
    setSuppliers((prev) =>
      selectedSupplier
        ? prev.map((supp) => (supp.id === newSupplier.id ? newSupplier : supp))
        : [...prev, newSupplier]
    );
    setIsFormOpen(false);
    setSelectedSupplier(null);
    fetchSuppliers(); // Refresh the list
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Suppliers</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600"
      >
        Add Supplier
      </button>
      {isFormOpen && (
        <SupplierForm
          supplier={selectedSupplier}
          onSupplierSaved={handleSave}
          onClose={() => setIsFormOpen(false)}
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Contact Info</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supp) => (
              <tr key={supp.id} className="hover:bg-gray-100">
                <td className="border p-2">{supp.supplier_name}</td>
                <td className="border p-2">{supp.contact_info}</td>
                <td className="border p-2">{supp.location}</td>
                <td className="border p-2">{supp.email || "N/A"}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(supp)}
                    className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(supp.id)}
                    className="bg-red-500 text-white p-1 rounded mr-2 hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/supplier-management/credits?supplierId=${supp.id}`}
                    className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                  >
                    View Credits
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierList;
