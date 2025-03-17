import { useState, useEffect } from "react";
import { getAllSuppliers, deleteSupplier } from "../api/supplierApi";
import { getUserRole } from "../utils/auth";

const SupplierList = ({ onView, setError, refresh }) => {
  const [suppliers, setSuppliers] = useState([]);
  const role = getUserRole();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getAllSuppliers();
        console.log("Fetched Suppliers:", data); // Debug
        setSuppliers(data || []);
      } catch (err) {
        setError(err || "Failed to fetch suppliers");
      }
    };
    fetchSuppliers();
  }, [setError, refresh]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id);
        setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
      } catch (err) {
        setError(err || "Failed to delete supplier");
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Supplier Name</th>
            <th className="py-2 px-4 border-b text-left">Contact Info</th>
            <th className="py-2 px-4 border-b text-left">Location</th>
            <th className="py-2 px-4 border-b text-left">Photo</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => {
              const photoUrl = supplier.photo
                ? `http://localhost:5000/${supplier.photo.replace(
                    /\\/g,
                    "/"
                  )}?t=${Date.now()}`
                : null;
              console.log(
                "Photo URL for",
                supplier.supplier_name,
                ":",
                photoUrl
              ); // Debug
              return (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    {supplier.supplier_name}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {supplier.contact_info || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {supplier.location || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {supplier.photo ? (
                      <img
                        src={photoUrl}
                        alt={supplier.supplier_name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          console.error(
                            `Failed to load image: ${supplier.photo}`
                          );
                          e.target.src = "/fallback-image.jpg";
                        }}
                      />
                    ) : (
                      "No Photo"
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => onView(supplier)}
                      className="text-green-600 hover:underline mr-2"
                    >
                      View
                    </button>
                    {role === "MANAGER" && (
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="py-2 px-4 text-center text-gray-500">
                No suppliers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierList;
