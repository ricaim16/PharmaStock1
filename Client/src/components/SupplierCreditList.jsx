// src/components/SupplierCreditList.jsx
import { useState, useEffect, useCallback } from "react";
import {
  getAllSuppliers,
  getSupplierCredits,
  deleteSupplierCredit,
} from "../api/supplierApi.js";
import SupplierCreditForm from "./SupplierCreditForm.jsx";
import { useLocation, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const SupplierCreditList = () => {
  const [credits, setCredits] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editCredit, setEditCredit] = useState(null);
  const [viewCredit, setViewCredit] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overdueCredits, setOverdueCredits] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  const formatEAT = useCallback((date) => {
    return new Date(date).toLocaleString("en-US", {
      timeZone: "Africa/Addis_Ababa",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const isOverdueByTwoMonths = useCallback((creditDate) => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    return new Date(creditDate) < twoMonthsAgo;
  }, []);

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
    const params = new URLSearchParams(location.search);
    const supplierIdFromUrl = params.get("supplierId");
    fetchSuppliers(supplierIdFromUrl);
  }, [location.search]);

  const fetchSuppliers = async (defaultSupplierId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSuppliers();
      setSuppliers(data || []);
      if (data && data.length > 0) {
        const initialSupplierId = defaultSupplierId || data[0].id;
        setSelectedSupplierId(initialSupplierId);
        fetchCredits(initialSupplierId);
      }
    } catch (err) {
      setError("Failed to fetch suppliers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCredits = async (supplierId) => {
    if (!supplierId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSupplierCredits(supplierId);
      const sortedCredits = (data.credits || []).sort(
        (a, b) => new Date(b.credit_date) - new Date(a.credit_date)
      );
      setCredits(sortedCredits);
      setOverdueCredits(
        sortedCredits.filter(
          (cred) =>
            cred.payment_status === "UNPAID" &&
            isOverdueByTwoMonths(cred.credit_date)
        )
      );
    } catch (err) {
      setError("Failed to fetch credits: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this credit?")) return;
    setLoading(true);
    try {
      await deleteSupplierCredit(id);
      setCredits((prev) => prev.filter((cred) => cred.id !== id));
      setOverdueCredits((prev) => prev.filter((cred) => cred.id !== id));
      fetchCredits(selectedSupplierId); // Refresh after deletion
    } catch (err) {
      setError("Failed to delete credit: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(
    (newCredit) => {
      if (!newCredit || typeof newCredit !== "object") {
        setError("Invalid credit data received");
        return;
      }
      setCredits((prev) =>
        editCredit
          ? prev.map((cred) => (cred.id === newCredit.id ? newCredit : cred))
          : [newCredit, ...prev]
      );
      setOverdueCredits((prev) =>
        newCredit.payment_status === "UNPAID" &&
        isOverdueByTwoMonths(newCredit.credit_date)
          ? editCredit
            ? prev.map((cred) => (cred.id === newCredit.id ? newCredit : cred))
            : [newCredit, ...prev]
          : prev.filter((cred) => cred.id !== newCredit.id)
      );
      setIsFormOpen(false);
      setEditCredit(null);
      fetchCredits(selectedSupplierId); // Refresh after save
    },
    [editCredit, selectedSupplierId, isOverdueByTwoMonths]
  );

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierId(supplierId);
    if (supplierId) fetchCredits(supplierId);
    setSearchTerm("");
  };

  const handleEdit = (credit) => {
    setEditCredit(credit);
    setIsFormOpen(true);
  };

  const handleView = (credit) => {
    setViewCredit(credit);
    setIsViewOpen(true);
  };

  const totalCreditAmount = credits.reduce(
    (sum, cred) => sum + (parseFloat(cred.credit_amount) || 0),
    0
  );
  const totalPaidAmount = credits.reduce(
    (sum, cred) => sum + (parseFloat(cred.paid_amount) || 0),
    0
  );
  const totalUnpaidAmount = credits.reduce(
    (sum, cred) => sum + (parseFloat(cred.unpaid_amount) || 0),
    0
  );

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier?.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Supplier Credits</h2>
        <Link
          to="/supplier-management/credit-report"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Credit Report
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <span>{error}</span>
          {selectedSupplierId && (
            <button
              onClick={() => fetchCredits(selectedSupplierId)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Supplier by Name
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers..."
            className="w-full sm:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <select
            value={selectedSupplierId}
            onChange={handleSupplierChange}
            className="w-full sm:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading || suppliers.length === 0}
          >
            <option value="">Select a supplier</option>
            {filteredSuppliers.map((supp) => (
              <option key={supp.id} value={supp.id}>
                {supp.supplier_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSupplierId && (
        <>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded mb-6 hover:bg-green-600 disabled:bg-green-300"
            disabled={loading}
          >
            Add Credit
          </button>

          {isFormOpen && (
            <SupplierCreditForm
              supplierId={selectedSupplierId}
              credit={editCredit}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditCredit(null);
              }}
            />
          )}

          {isViewOpen && viewCredit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4">Credit Details</h3>
                <p>
                  <strong>Supplier:</strong>{" "}
                  {viewCredit.supplier?.supplier_name || "N/A"}
                </p>
                <p>
                  <strong>Credit Amount:</strong>{" "}
                  {parseFloat(viewCredit.credit_amount || 0).toFixed(2)}
                </p>
                <p>
                  <strong>Paid Amount:</strong>{" "}
                  {parseFloat(viewCredit.paid_amount || 0).toFixed(2)}
                </p>
                <p>
                  <strong>Unpaid Amount:</strong>{" "}
                  {parseFloat(viewCredit.unpaid_amount || 0).toFixed(2)}
                </p>
                <p>
                  <strong>Medicine Name:</strong>{" "}
                  {viewCredit.medicine_name || "N/A"}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {viewCredit.payment_method || "N/A"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {viewCredit.description || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {viewCredit.payment_status || "N/A"}
                </p>
                {viewCredit.payment_file && (
                  <p>
                    <strong>Payment File:</strong>{" "}
                    <a
                      href={`http://localhost:5000/uploads/${viewCredit.payment_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  </p>
                )}
                <p>
                  <strong>Credit Date:</strong>{" "}
                  {formatEAT(viewCredit.credit_date)}
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {formatEAT(viewCredit.updated_at)}
                </p>
                {userRole === "MANAGER" && (
                  <>
                    <p>
                      <strong>Created By:</strong>{" "}
                      {viewCredit.createdBy?.username || "N/A"}
                    </p>
                    <p>
                      <strong>Updated By:</strong>{" "}
                      {viewCredit.updatedBy?.username || "N/A"}
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

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Supplier Name</th>
                  <th className="border p-2">Credit Amount</th>
                  <th className="border p-2">Paid Amount</th>
                  <th className="border p-2">Unpaid Amount</th>
                  <th className="border p-2">Medicine Name</th>
                  <th className="border p-2">Payment Method</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Payment File</th>
                  <th className="border p-2">Credit Date</th>
                  <th className="border p-2">Last Updated</th>
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
                {credits.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={userRole === "MANAGER" ? 14 : 12}
                      className="border p-2 text-center"
                    >
                      No credits available.
                    </td>
                  </tr>
                ) : (
                  credits.map((cred) => (
                    <tr
                      key={cred.id}
                      className={
                        cred.payment_status === "UNPAID" &&
                        isOverdueByTwoMonths(cred.credit_date)
                          ? "bg-red-100"
                          : "hover:bg-gray-100"
                      }
                    >
                      <td className="border p-2">
                        {cred.supplier?.supplier_name || "N/A"}
                      </td>
                      <td className="border p-2">
                        {parseFloat(cred.credit_amount || 0).toFixed(2)}
                      </td>
                      <td className="border p-2">
                        {parseFloat(cred.paid_amount || 0).toFixed(2)}
                      </td>
                      <td className="border p-2">
                        {parseFloat(cred.unpaid_amount || 0).toFixed(2)}
                      </td>
                      <td className="border p-2">
                        {cred.medicine_name || "N/A"}
                      </td>
                      <td className="border p-2">
                        {cred.payment_method || "N/A"}
                      </td>
                      <td className="border p-2">
                        {cred.description || "N/A"}
                      </td>
                      <td
                        className={`border p-2 ${
                          cred.payment_status === "UNPAID"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {cred.payment_status || "N/A"}
                      </td>
                      <td className="border p-2">
                        {cred.payment_file ? (
                          <a
                            href={`http://localhost:5000/uploads/${cred.payment_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="border p-2">
                        {cred.credit_date ? formatEAT(cred.credit_date) : "N/A"}
                      </td>
                      <td className="border p-2">
                        {cred.updated_at ? formatEAT(cred.updated_at) : "N/A"}
                      </td>
                      {userRole === "MANAGER" && (
                        <td className="border p-2">
                          {cred.createdBy?.username || "N/A"}
                        </td>
                      )}
                      {userRole === "MANAGER" && (
                        <td className="border p-2">
                          {cred.updatedBy?.username || "N/A"}
                        </td>
                      )}
                      <td className="border p-2 space-x-2">
                        <button
                          onClick={() => handleView(cred)}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
                          disabled={loading}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(cred)}
                          className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600 disabled:bg-yellow-300"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cred.id)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600 disabled:bg-red-300"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border p-2">Total</td>
                  <td className="border p-2">{totalCreditAmount.toFixed(2)}</td>
                  <td className="border p-2">{totalPaidAmount.toFixed(2)}</td>
                  <td className="border p-2">{totalUnpaidAmount.toFixed(2)}</td>
                  <td
                    colSpan={userRole === "MANAGER" ? 10 : 8}
                    className="border p-2"
                  ></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {overdueCredits.length > 0 && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
              <h3 className="text-lg font-semibold text-red-800">
                Overdue Credits Alert (2+ Months)
              </h3>
              <p className="text-red-700">
                The following credits are unpaid for 2 months or more:
              </p>
              <ul className="list-disc pl-5">
                {overdueCredits.map((cred) => (
                  <li key={cred.id} className="text-red-600">
                    {parseFloat(cred.credit_amount).toFixed(2)} -{" "}
                    {cred.medicine_name || "N/A"} ({cred.description || "N/A"})
                    - Due since: {formatEAT(cred.credit_date)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SupplierCreditList;
