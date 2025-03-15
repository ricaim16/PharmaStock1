import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SupplierCreditForm from "../components/SupplierCreditForm";
import {
  getAllSupplierCredits,
  deleteSupplierCredit,
  getUserById,
  getAllSuppliers,
} from "../api/supplierApi";
import { getToken, getUserRole, getUserId } from "../utils/auth";

const SupplierCreditManagement = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const currentUserId = getUserId();
  const [credits, setCredits] = useState([]);
  const [users, setUsers] = useState({});
  const [suppliers, setSuppliers] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [viewCredit, setViewCredit] = useState(null);
  const [showCreditReport, setShowCreditReport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // For list refresh
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
    } else if (role !== "MANAGER" && role !== "EMPLOYEE") {
      navigate("/dashboard");
    } else {
      fetchCredits();
    }
  }, [navigate, role]);

  const fetchCredits = async () => {
    try {
      const data = await getAllSupplierCredits();
      let filteredCredits = data || [];

      if (role === "EMPLOYEE" && currentUserId) {
        filteredCredits = filteredCredits.filter(
          (credit) => credit.created_by === currentUserId
        );
      }

      setCredits(filteredCredits);
      console.log(
        "Credit Supplier IDs:",
        filteredCredits.map((credit) => credit.supplier_id)
      );

      const userIds = [
        ...new Set(filteredCredits.map((credit) => credit.created_by)),
      ];
      const userPromises = userIds.map((id) => getUserById(id));
      const userData = await Promise.all(userPromises);
      const userMap = userData.reduce(
        (acc, user) => ({ ...acc, [user.id]: user }),
        {}
      );
      setUsers(userMap);

      const supplierData = await getAllSuppliers();
      console.log("Fetched Suppliers:", supplierData);
      const supplierMap = supplierData.reduce(
        (acc, supplier) => ({ ...acc, [supplier.id]: supplier.supplier_name }),
        {}
      );
      setSuppliers(supplierMap);
    } catch (err) {
      setError(err || "Failed to fetch credits");
    }
  };

  const handleCreditSaved = (newCredit) => {
    setIsFormOpen(false);
    setSelectedCredit(null);
    setViewCredit(null); // Close view modal after saving
    setRefreshKey((prev) => prev + 1); // Trigger list refresh
  };

  const handleEdit = (credit) => {
    setSelectedCredit(credit);
    setIsFormOpen(true);
  };

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

  const handleViewCredit = (credit) => {
    if (role === "EMPLOYEE" && credit.created_by !== currentUserId) {
      setError("You can only view your own credits.");
      return;
    }
    setViewCredit(credit);
  };

  const handleGenerateCreditReport = () => {
    setShowCreditReport(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedCredit(null);
    setViewCredit(null);
    setShowCreditReport(false);
  };

  const formatUserDetails = (user) => {
    if (!user) return "Unknown";
    const { FirstName, LastName } = user;
    return `${FirstName || "N/A"} ${LastName || "N/A"}`;
  };

  const reportCredits =
    role === "EMPLOYEE" && currentUserId
      ? credits.filter((credit) => credit.created_by === currentUserId)
      : credits;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Supplier Credit Management
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Credit
            </button>
            <button
              onClick={handleGenerateCreditReport}
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Generate Credit Report
            </button>
          </div>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {role === "MANAGER" && (
                  <th className="py-2 px-4 border-b text-left">Created By</th>
                )}
                <th className="py-2 px-4 border-b text-left">Supplier Name</th>
                <th className="py-2 px-4 border-b text-left">Credit Amount</th>
                <th className="py-2 px-4 border-b text-left">Paid Amount</th>
                <th className="py-2 px-4 border-b text-left">Payment Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credits.length > 0 ? (
                credits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    {role === "MANAGER" && (
                      <td className="py-2 px-4 border-b">
                        {formatUserDetails(users[credit.created_by]) ||
                          credit.created_by}
                      </td>
                    )}
                    <td className="py-2 px-4 border-b">
                      {suppliers[credit.supplier_id] || "Unknown"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {credit.credit_amount}
                    </td>
                    <td className="py-2 px-4 border-b">{credit.paid_amount}</td>
                    <td className="py-2 px-4 border-b">
                      {credit.payment_status}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleViewCredit(credit)}
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
                  <td
                    colSpan={role === "MANAGER" ? "6" : "5"}
                    className="py-2 px-4 text-center text-gray-500"
                  >
                    No credits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {viewCredit && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4 relative">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold">Credit Details</h2>
              <div className="space-y-2">
                <p>
                  <strong>ID:</strong> {viewCredit.id}
                </p>
                <p>
                  <strong>Supplier Name:</strong>{" "}
                  {suppliers[viewCredit.supplier_id] || "Unknown"}
                </p>
                <p>
                  <strong>Supplier ID:</strong> {viewCredit.supplier_id}
                </p>
                {role === "MANAGER" && (
                  <p>
                    <strong>Created By:</strong>{" "}
                    {formatUserDetails(users[viewCredit.created_by]) ||
                      viewCredit.created_by}
                  </p>
                )}
                <p>
                  <strong>Credit Amount:</strong> {viewCredit.credit_amount}
                </p>
                <p>
                  <strong>Paid Amount:</strong> {viewCredit.paid_amount}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {viewCredit.description || "N/A"}
                </p>
                <p>
                  <strong>Transaction Type:</strong>{" "}
                  {viewCredit.transaction_type}
                </p>
                <p>
                  <strong>Payment Status:</strong> {viewCredit.payment_status}
                </p>
                <p>
                  <strong>Credit Date:</strong>{" "}
                  {new Date(viewCredit.credit_date).toLocaleString()}
                </p>
                <p>
                  <strong>Payment File:</strong>{" "}
                  {viewCredit.payment_file ? (
                    <a
                      href={`http://localhost:5000/uploads/${viewCredit.payment_file
                        .split("/")
                        .pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View File
                    </a>
                  ) : (
                    "None"
                  )}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(viewCredit.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(viewCredit.updated_at).toLocaleString()}
                </p>
              </div>
              {(role === "MANAGER" || role === "EMPLOYEE") && (
                <button
                  onClick={() => handleEdit(viewCredit)}
                  className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        )}

        {showCreditReport && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg absolute top-2.5 bottom-2.5 left-2.5 right-2.5 overflow-y-auto">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">Generate Credit Report</h2>
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 sticky top-0">
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">
                      Supplier ID
                    </th>
                    <th className="py-2 px-4 border-b text-left">
                      Supplier Name
                    </th>
                    {role === "MANAGER" && (
                      <th className="py-2 px-4 border-b text-left">
                        Created By
                      </th>
                    )}
                    <th className="py-2 px-4 border-b text-left">
                      Credit Amount
                    </th>
                    <th className="py-2 px-4 border-b text-left">
                      Paid Amount
                    </th>
                    <th className="py-2 px-4 border-b text-left">
                      Description
                    </th>
                    <th className="py-2 px-4 border-b text-left">
                      Transaction Type
                    </th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">
                      Credit Date
                    </th>
                    <th className="py-2 px-4 border-b text-left">Created At</th>
                    <th className="py-2 px-4 border-b text-left">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCredits.map((credit) => (
                    <tr key={credit.id}>
                      <td className="py-2 px-4 border-b">{credit.id}</td>
                      <td className="py-2 px-4 border-b">
                        {credit.supplier_id}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {suppliers[credit.supplier_id] || "Unknown"}
                      </td>
                      {role === "MANAGER" && (
                        <td className="py-2 px-4 border-b">
                          {formatUserDetails(users[credit.created_by]) ||
                            credit.created_by}
                        </td>
                      )}
                      <td className="py-2 px-4 border-b">
                        {credit.credit_amount}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {credit.paid_amount}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {credit.description || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {credit.transaction_type}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {credit.payment_status}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(credit.credit_date).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(credit.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(credit.updated_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isFormOpen && (
          <SupplierCreditForm
            credit={selectedCredit}
            onCreditSaved={handleCreditSaved}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default SupplierCreditManagement;
