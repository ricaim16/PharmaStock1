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
    payment_method: "CBE",
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
        payment_method: sale.payment_method || "CBE",
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
      setError("Failed to load dropdown data: " + err.message);
    }
  };

  const updateFormFields = (medicineId, dosageFormId) => {
    if (!medicineId || !dosageFormId) return;

    const selectedMedicine = medicines.find((med) => med.id === medicineId);
    if (selectedMedicine) {
      setFormData((prev) => ({
        ...prev,
        price: selectedMedicine.sell_price || 0,
        product_batch_number: selectedMedicine.batch_number || "",
        product_name: selectedMedicine.medicine_name || prev.product_name,
        quantity: "",
        total_amount: "",
        prescription: selectedMedicine.required_prescription
          ? prev.prescription
          : false,
      }));
    }
  };

  const handleMedicineChange = (e) => {
    const medicineId = e.target.value;
    setFormData((prev) => ({ ...prev, medicine_id: medicineId }));
    if (formData.dosage_form_id) {
      updateFormFields(medicineId, formData.dosage_form_id);
    }
  };

  const handleDosageChange = (e) => {
    const dosageFormId = e.target.value;
    setFormData((prev) => ({ ...prev, dosage_form_id: dosageFormId }));
    if (formData.medicine_id) {
      updateFormFields(formData.medicine_id, dosageFormId);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "quantity" && prev.medicine_id && prev.dosage_form_id) {
        const selectedMedicine = medicines.find(
          (med) => med.id === prev.medicine_id
        );
        newData.total_amount =
          value && selectedMedicine?.sell_price
            ? parseInt(value) * selectedMedicine.sell_price
            : "";
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const requiredFields = ["medicine_id", "dosage_form_id", "quantity"];
    if (requiredFields.some((field) => !formData[field])) {
      setError("Medicine, dosage form, and quantity are required.");
      setIsSubmitting(false);
      return;
    }

    const selectedMedicine = medicines.find(
      (med) => med.id === formData.medicine_id
    );
    if (
      selectedMedicine &&
      parseInt(formData.quantity) > selectedMedicine.quantity
    ) {
      setError(
        `Quantity exceeds available stock (${selectedMedicine.quantity}).`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        medicine_id: formData.medicine_id,
        customer_id: formData.customer_id || null,
        dosage_form_id: formData.dosage_form_id,
        quantity: parseInt(formData.quantity),
        prescription: formData.prescription,
        product_name: formData.product_name,
      };
      console.log("Submitting payload:", JSON.stringify(payload, null, 2));
      const response = sale
        ? await editSale(sale.id, payload)
        : await addSale(payload);
      console.log("API response:", response);
      onSave(response);
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err.response?.data?.message || "Failed to save sale: " + err.message
      );
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
            Customer (Optional)
          </label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
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
            onChange={handleMedicineChange}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          >
            <option value="">Select Medicine</option>
            {medicines.map((med) => (
              <option key={med.id} value={med.id}>
                {med.medicine_name} (Stock: {med.quantity})
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
            onChange={handleDosageChange}
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
            disabled={
              isSubmitting || !formData.medicine_id || !formData.dosage_form_id
            }
            min="1"
            placeholder={
              formData.medicine_id && formData.dosage_form_id
                ? "Enter quantity"
                : "Select medicine and dosage first"
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (From Medicine)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
            step="0.01"
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
          <input
            type="text"
            value={formData.payment_method}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
          />
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
            Prescription Provided
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
            Batch Number (From Medicine)
          </label>
          <input
            type="text"
            name="product_batch_number"
            value={formData.product_batch_number}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
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
