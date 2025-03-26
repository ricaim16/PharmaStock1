// components/CustomerCreditList.jsx
import { useState, useEffect, useCallback } from "react";
import {
  getAllCustomers,
  getCustomerCredits,
  deleteCustomerCredit,
} from "../api/customerApi.js";
import CustomerCreditForm from "./CustomerCreditForm.jsx";
import { useLocation } from "react-router-dom";

const currentUser = { role: "MANAGER" }; // Mock user role

const CustomerCreditList = () => {
  const [credits, setCredits] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCredit, setEditCredit] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overdueCredits, setOverdueCredits] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const formatEAT = useCallback((date) => {
    const options = {
      timeZone: "Africa/Addis_Ababa",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    return new Date(date).toLocaleString("en-US", options);
  }, []);

  const isOverdueByTwoMonths = useCallback((creditDate) => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    return new Date(creditDate) < twoMonthsAgo;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customerIdFromUrl = params.get("customerId");
    console.log("useEffect triggered, customerIdFromUrl:", customerIdFromUrl);
    fetchCustomers(customerIdFromUrl);
  }, [location.search]);

  const fetchCustomers = async (defaultCustomerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCustomers();
      console.log("Customers fetched:", data);
      if (!data || data.length === 0) {
        setError("No customers found.");
        setCustomers([]);
        return;
      }
      setCustomers(data);
      const initialCustomerId =
        defaultCustomerId || (data.length > 0 ? data[0].id : "");
      if (initialCustomerId) {
        setSelectedCustomerId(initialCustomerId);
        fetchCredits(initialCustomerId);
      }
    } catch (err) {
      console.error("Fetch customers error:", err.message);
      setError(
        "Failed to fetch customers: " + (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCredits = async (customerId) => {
    if (!customerId) {
      setError("Please select a customer to view credits.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerCredits(customerId);
      console.log("Credits fetched:", data);
      const sortedCredits = (data.credits || []).sort(
        (a, b) => new Date(b.credit_date) - new Date(a.credit_date)
      );
      setCredits(sortedCredits);
      setOverdueCredits(
        sortedCredits.filter(
          (cred) =>
            cred.status === "UNPAID" && isOverdueByTwoMonths(cred.credit_date)
        )
      );
    } catch (err) {
      console.error("Fetch credits error:", err.message);
      setError("Failed to fetch credits: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this credit?")) return;
    setLoading(true);
    try {
      await deleteCustomerCredit(id);
      setCredits((prev) => prev.filter((cred) => cred.id !== id));
      setOverdueCredits((prev) => prev.filter((cred) => cred.id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete credit: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(
    (newCredit) => {
      if (!newCredit || typeof newCredit !== "object") {
        console.error("Invalid newCredit object:", newCredit);
        setError("Failed to save credit: Invalid data received");
        return;
      }
      if (editCredit) {
        setCredits((prev) =>
          prev.map((cred) => (cred.id === newCredit.id ? newCredit : cred))
        );
        setOverdueCredits((prev) =>
          newCredit.status === "UNPAID" &&
          isOverdueByTwoMonths(newCredit.credit_date)
            ? prev.map((cred) => (cred.id === newCredit.id ? newCredit : cred))
            : prev.filter((cred) => cred.id !== newCredit.id)
        );
        setEditCredit(null);
      } else {
        setCredits((prev) => [newCredit, ...prev]);
        if (
          newCredit.status === "UNPAID" &&
          isOverdueByTwoMonths(newCredit.credit_date)
        ) {
          setOverdueCredits((prev) => [newCredit, ...prev]);
        }
      }
      setIsFormOpen(false);
      fetchCredits(selectedCustomerId);
    },
    [editCredit, selectedCustomerId, isOverdueByTwoMonths]
  );

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    if (customerId) fetchCredits(customerId);
    setSearchTerm("");
  };

  const handleEdit = (credit) => {
    setEditCredit(credit);
    setIsFormOpen(true);
  };

  const totalCreditAmount = credits.reduce((sum, cred) => {
    return (
      sum + (cred && cred.credit_amount ? parseFloat(cred.credit_amount) : 0)
    );
  }, 0);

  const filteredCustomers = customers.filter((customer) =>
    customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isManager = currentUser.role === "MANAGER";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Customer Credits
      </h2>

      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <span>{error}</span>
          {selectedCustomerId && (
            <button
              onClick={() => fetchCredits(selectedCustomerId)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Customer by Name
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full sm:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <select
            value={selectedCustomerId}
            onChange={handleCustomerChange}
            className="w-full sm:w-64 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading || customers.length === 0}
          >
            <option value="">Select a customer</option>
            {filteredCustomers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCustomerId ? (
        <>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded mb-6 hover:bg-green-600 disabled:bg-green-300"
            disabled={loading}
          >
            Add Credit
          </button>

          {isFormOpen && (
            <CustomerCreditForm
              customerId={selectedCustomerId}
              credit={editCredit}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditCredit(null);
              }}
            />
          )}

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Customer Name</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Payment File</th>
                  <th className="border p-2">Credit Date</th>
                  <th className="border p-2">Last Updated</th>
                  {isManager && <th className="border p-2">Created By</th>}
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {credits.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={isManager ? 9 : 8}
                      className="border p-2 text-center"
                    >
                      No credits available for this customer.
                    </td>
                  </tr>
                ) : (
                  credits.map((cred) => (
                    <tr
                      key={cred?.id || Math.random()} // Fallback key if id is missing
                      className={
                        cred?.status === "UNPAID" &&
                        isOverdueByTwoMonths(cred.credit_date)
                          ? "bg-red-100"
                          : "hover:bg-gray-100"
                      }
                    >
                      <td className="border p-2">
                        {cred?.customer?.name || "N/A"}
                      </td>
                      <td className="border p-2">
                        {cred?.credit_amount
                          ? parseFloat(cred.credit_amount).toFixed(2)
                          : "N/A"}
                      </td>
                      <td className="border p-2">
                        {cred?.description || "N/A"}
                      </td>
                      <td
                        className={`border p-2 ${
                          cred?.status === "UNPAID"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {cred?.status || "N/A"}
                      </td>
                      <td className="border p-2">
                        {cred?.payment_file ? (
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
                        {cred?.credit_date
                          ? formatEAT(cred.credit_date)
                          : "N/A"}
                      </td>
                      <td className="border p-2">
                        {cred?.updated_at ? formatEAT(cred.updated_at) : "N/A"}
                      </td>
                      {isManager && (
                        <td className="border p-2">
                          {cred?.user?.username || "N/A"}
                        </td>
                      )}
                      <td className="border p-2 space-x-2">
                        <button
                          onClick={() => handleEdit(cred)}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cred?.id)}
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
                  <td colSpan={isManager ? 7 : 6} className="border p-2"></td>
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
                  <li key={cred?.id || Math.random()} className="text-red-600">
                    {cred?.credit_amount || "N/A"} -{" "}
                    {cred?.description || "N/A"} (Due since:{" "}
                    {cred?.credit_date ? formatEAT(cred.credit_date) : "N/A"})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-600">
          Please select a customer to view or add credits.
        </div>
      )}
    </div>
  );
};

export default CustomerCreditList;
