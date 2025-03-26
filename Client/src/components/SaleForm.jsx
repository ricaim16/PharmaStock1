import { useState, useEffect } from "react";
import { addSale, editSale } from "../api/salesApi";
import { getAllCustomers } from "../api/customerApi";
import { getAllMedicines } from "../api/medicineApi";
import { getAllDosageForms } from "../api/dosageApi";

const SaleForm = ({ sale, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    medicine_id: "",
    dosage_form_id: "",
    quantity: "",
    price: "",
    total_amount: "",
    payment_method: "NONE",
    prescription: false,
    product_name: "",
    product_batch_number: "",
    sealed_date: new Date().toISOString().slice(0, 10),
  });
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [dosageForms, setDosageForms] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sale) {
      setFormData({
        customer_id: sale.customer_id || "",
        medicine_id: sale.medicine_id || "",
        dosage_form_id: sale.dosage_form_id || "",
        quantity: sale.quantity || "",
        price: sale.price || "",
        total_amount: sale.total_amount || "",
        payment_method: sale.payment_method || "NONE",
        prescription: sale.prescription || false,
        product_name: sale.product_name || "",
        product_batch_number: sale.product_batch_number || "",
        sealed_date: sale.sealed_date
          ? new Date(sale.sealed_date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      });
    }
    fetchDropdownData();
  }, [sale]);

  const fetchDropdownData = async () => {
    try {
      const [custRes, medRes, doseRes] = await Promise.all([
        getAllCustomers(),
        getAllMedicines(),
        getAllDosageForms(),
      ]);
      setCustomers(custRes);
      setMedicines(medRes);
      setDosageForms(doseRes);
    } catch (err) {
      setError("Failed to load dropdown data");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "quantity" || name === "price") {
        const qty =
          name === "quantity"
            ? parseInt(value) || 0
            : parseInt(prev.quantity) || 0;
        const prc =
          name === "price"
            ? parseFloat(value) || 0
            : parseFloat(prev.price) || 0;
        newData.total_amount = qty * prc;
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const requiredFields = [
      "customer_id",
      "medicine_id",
      "dosage_form_id",
      "quantity",
      "price",
    ];
    if (requiredFields.some((field) => !formData[field])) {
      setError("All required fields must be filled.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        total_amount: parseFloat(formData.total_amount),
      };
      const response = sale
        ? await editSale(sale.id, payload)
        : await addSale(payload);
      onSave(response);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow mb-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Customer
          </label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          >
            <option value="">Select Customer</option>
            {customers.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Medicine
          </label>
          <select
            name="medicine_id"
            value={formData.medicine_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          >
            <option value="">Select Medicine</option>
            {medicines.map((med) => (
              <option key={med.id} value={med.id}>
                {med.medicine_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dosage Form
          </label>
          <select
            name="dosage_form_id"
            value={formData.dosage_form_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          >
            <option value="">Select Dosage Form</option>
            {dosageForms.map((dose) => (
              <option key={dose.id} value={dose.id}>
                {dose.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Amount
          </label>
          <input
            type="number"
            name="total_amount"
            value={formData.total_amount}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          >
            <option value="NONE">None</option>
            <option value="CASH">Cash</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <input
              type="checkbox"
              name="prescription"
              checked={formData.prescription}
              onChange={handleChange}
              className="mr-2"
              disabled={isSubmitting}
            />
            Prescription Required
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Batch Number
          </label>
          <input
            type="text"
            name="product_batch_number"
            value={formData.product_batch_number}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sale Date
          </label>
          <input
            type="date"
            name="sealed_date"
            value={formData.sealed_date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex space-x-4 mt-4">
        <button
          type="submit"
          className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SaleForm;
