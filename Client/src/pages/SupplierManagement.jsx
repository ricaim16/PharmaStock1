import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SupplierList from "../components/SupplierList";
import SupplierDetailsModal from "../components/SupplierDetailsModal";
import SupplierForm from "../components/SupplierForm";
import { getToken, getUserRole } from "../utils/auth";

const SupplierManagement = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const [viewSupplier, setViewSupplier] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For refreshing SupplierList
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
    }
  }, [navigate]);

  const handleView = (supplier) => {
    setViewSupplier(supplier);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setIsFormOpen(true);
  };

  const handleSupplierSaved = () => {
    setIsFormOpen(false);
    setSelectedSupplier(null);
    setRefreshKey((prev) => prev + 1); // Trigger list refresh
    setViewSupplier(null); // Close view modal after saving
  };

  const handleClose = () => {
    setViewSupplier(null);
    setIsFormOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Supplier Management
          </h1>
          {role === "MANAGER" && (
            <button
              onClick={handleAdd}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Add Supplier
            </button>
          )}
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <SupplierList
          onView={handleView} // Only pass onView
          setError={setError}
          refresh={refreshKey}
        />
        {viewSupplier && (
          <SupplierDetailsModal
            supplier={viewSupplier}
            onClose={handleClose}
            onEdit={role === "MANAGER" ? handleEdit : null} // Pass handleEdit to modal
          />
        )}
        {isFormOpen && (
          <SupplierForm
            supplier={selectedSupplier}
            onSupplierSaved={handleSupplierSaved}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default SupplierManagement;
