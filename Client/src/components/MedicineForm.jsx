import { useState, useEffect } from "react";
import { addMedicine, editMedicine } from "../api/medicineApi";
import { getAllCategories } from "../api/categoryApi";
import { getAllDosageForms } from "../api/dosageApi";
import { getAllSuppliers } from "../api/supplierApi";

const MedicineForm = ({ medicine, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    medicine_name: "",
    brand_name: "",
    batch_number: "",
    category_id: "",
    dosage_form_id: "",
    medicine_weight: "",
    quantity: "",
    supplier_id: "",
    unit_price: "",
    sell_price: "",
    expire_date: new Date().toISOString().slice(0, 10), // Default to today
    required_prescription: false,
    payment_method: "NONE",
    Payment_file: null,
    details: "",
  });
  const [categories, setCategories] = useState([]);
  const [dosageForms, setDosageForms] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicine) {
      setFormData({
        ...medicine,
        Payment_file: null,
        expire_date: medicine.expire_date
          ? new Date(medicine.expire_date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      });
    }
    fetchDropdownData();
  }, [medicine]);

  const fetchDropdownData = async () => {
    try {
      const [catRes, dosRes, supRes] = await Promise.all([
        getAllCategories(),
        getAllDosageForms(),
        getAllSuppliers(),
      ]);
      setCategories(catRes);
      setDosageForms(dosRes);
      setSuppliers(supRes);
    } catch (err) {
      setError("Failed to load dropdown data");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    let newValue = value;

    if (
      ["quantity", "unit_price", "sell_price", "medicine_weight"].includes(name)
    ) {
      newValue = value === "" ? "" : parseFloat(value) || "";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (
      !formData.medicine_name ||
      !formData.quantity ||
      !formData.unit_price ||
      !formData.category_id ||
      !formData.dosage_form_id ||
      !formData.supplier_id ||
      !formData.expire_date
    ) {
      setError("All required fields must be filled.");
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined) {
          submissionData.append(key, formData[key]);
        }
      }

      let response;
      if (medicine) {
        response = await editMedicine(medicine.id, submissionData);
      } else {
        response = await addMedicine(submissionData);
      }
      const savedMedicine = response.medicine || response; // Adjust based on backend response
      onSave(savedMedicine);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to save medicine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow mb-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="md:w-1/2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Medicine Name
            </label>
            <input
              type="text"
              name="medicine_name"
              value={formData.medicine_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Brand Name
            </label>
            <input
              type="text"
              name="brand_name"
              value={formData.brand_name}
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
              name="batch_number"
              value={formData.batch_number}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
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
              {dosageForms.map((dos) => (
                <option key={dos.id} value={dos.id}>
                  {dos.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Medicine Weight
            </label>
            <input
              type="number"
              name="medicine_weight"
              value={formData.medicine_weight}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              disabled={isSubmitting}
            />
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
            />
          </div>
        </div>
        <div className="md:w-1/2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.supplier_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unit Price
            </label>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sell Price
            </label>
            <input
              type="number"
              name="sell_price"
              value={formData.sell_price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expire Date
            </label>
            <input
              type="date"
              name="expire_date"
              value={formData.expire_date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="required_prescription"
              checked={formData.required_prescription}
              onChange={handleChange}
              className="mr-2"
              disabled={isSubmitting}
            />
            <label className="text-sm font-medium text-gray-700">
              Requires Prescription
            </label>
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
              <option value="CBE">CBE</option>
              <option value="COOP">COOP</option>
              <option value="AWASH">Awash</option>
              <option value="EBIRR">Ebirr</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment File
            </label>
            <input
              type="file"
              name="Payment_file"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Details
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            />
          </div>
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

export default MedicineForm;
