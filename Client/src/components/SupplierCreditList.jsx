import { useState, useEffect } from "react";
import {
  getAllSupplierCredits,
  deleteSupplierCredit,
} from "../api/supplierApi";
import { getUserRole } from "../utils/auth";

const SupplierCreditList = ({ onView, setError, refresh }) => {
  const [credits, setCredits] = useState([]);
  const role = getUserRole();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const data = await getAllSupplierCredits();
        setCredits(data || []);
      } catch (err) {
        setError(err || "Failed to fetch credits");
      }
    };
    fetchCredits();
  }, [setError, refresh]);

  const handleDelete = async (id) => {
    if (role !== "MANAGER") {
      setError("Only managers can delete credits.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this credit?")) {
      try {
        await deleteSupplierCredit(id);
        setCredits(credits.filter((credit) => credit.id !== id));
      } catch (err) {
        setError(err || "Failed to delete credit");
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Supplier</th>
            <th className="py-2 px-4 border-b text-left">Credit Amount</th>
            <th className="py-2 px-4 border-b text-left">Paid Amount</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Description</th>
            <th className="py-2 px-4 border-b text-left">Transaction Type</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {credits.length > 0 ? (
            credits.map((credit) => (
              <tr key={credit.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  {credit.supplier?.supplier_name || "Unknown"}
                </td>
                <td className="py-2 px-4 border-b">{credit.credit_amount}</td>
                <td className="py-2 px-4 border-b">{credit.paid_amount}</td>
                <td className="py-2 px-4 border-b">{credit.payment_status}</td>
                <td className="py-2 px-4 border-b">
                  {credit.description || "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  {credit.transaction_type}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => onView(credit)}
                    className="text-green-600 hover:underline mr-2"
                  >
                    View
                  </button>
                  {role === "MANAGER" && (
                    <button
                      onClick={() => handleDelete(credit.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="py-2 px-4 text-center text-gray-500">
                No credits found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierCreditList;
