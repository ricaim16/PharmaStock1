// src/components/CustomerList.jsx
import { useState, useEffect } from "react";
import { getAllCustomers, deleteCustomer } from "../api/customerApi";
import CustomerForm from "./CustomerForm";
import { Link } from "react-router-dom"; // Add this

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data.sort((a, b) => a.name.localeCompare(b.name)));
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch customers: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        setCustomers(customers.filter((cust) => cust.id !== id));
        setError(null);
      } catch (err) {
        setError(
          "Failed to delete customer: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleSave = (newCustomer) => {
    setCustomers((prev) =>
      selectedCustomer
        ? prev.map((cust) => (cust.id === newCustomer.id ? newCustomer : cust))
        : [...prev, newCustomer]
    );
    setIsFormOpen(false);
    setSelectedCustomer(null);
    fetchCustomers();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600"
      >
        Add Customer
      </button>
      {isFormOpen && (
        <CustomerForm
          customer={selectedCustomer}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((cust) => (
              <tr
                key={cust.id}
                className={`${
                  cust.status === "INACTIVE"
                    ? "bg-gray-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <td className="border p-2">{cust.name}</td>
                <td className="border p-2">{cust.phone}</td>
                <td className="border p-2">{cust.address}</td>
                <td
                  className={`border p-2 ${
                    cust.status === "ACTIVE" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {cust.status}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(cust)}
                    className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cust.id)}
                    className="bg-red-500 text-white p-1 rounded mr-2 hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/customer-management/credits?customerId=${cust.id}`}
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

export default CustomerList;
