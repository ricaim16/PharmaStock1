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
    expire_date: "",
    required_prescription: false,
    payment_method: "NONE",
    Payment_file: null,
    details: "",
  });
  const [categories, setCategories] = useState([]);
  const [dosageForms, setDosageForms] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New loading state

  useEffect(() => {
    if (medicine) {
      setFormData({
        ...medicine,
        Payment_file: null,
        expire_date: medicine.expire_date
          ? medicine.expire_date.split("T")[0]
          : "",
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
    if (name === "expire_date") {
      newValue = value === "" ? "" : value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button
    setError(null); // Clear previous errors
    try {
      const submissionData = {};
      for (const key in formData) {
        if (
          formData[key] === "" &&
          ![
            "medicine_name",
            "quantity",
            "unit_price",
            "category_id",
            "dosage_form_id",
            "supplier_id",
          ].includes(key)
        ) {
          submissionData[key] = undefined;
        } else if (["quantity", "medicine_weight"].includes(key)) {
          submissionData[key] = formData[key]
            ? parseInt(formData[key], 10)
            : formData[key];
        } else if (["unit_price", "sell_price"].includes(key)) {
          submissionData[key] = formData[key]
            ? parseFloat(formData[key])
            : formData[key];
        } else {
          submissionData[key] = formData[key];
        }
      }

      let response;
      if (medicine) {
        response = await editMedicine(medicine.id, submissionData);
      } else {
        response = await addMedicine(submissionData);
      }
      const savedMedicine = response.data.medicine || response.data;
      onSave(savedMedicine);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to save medicine");
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow mb-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="md:w-1/2 space-y-4">
          <input
            type="text"
            name="medicine_name"
            value={formData.medicine_name}
            onChange={handleChange}
            placeholder="Medicine Name"
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
          <input
            type="text"
            name="brand_name"
            value={formData.brand_name}
            onChange={handleChange}
            placeholder="Brand Name"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          <input
            type="text"
            name="batch_number"
            value={formData.batch_number}
            onChange={handleChange}
            placeholder="Batch Number"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
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
          <input
            type="number"
            name="medicine_weight"
            value={formData.medicine_weight}
            onChange={handleChange}
            placeholder="Medicine Weight"
            className="w-full p-2 border rounded"
            step="0.01"
            disabled={isSubmitting}
          />
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="md:w-1/2 space-y-4">
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
          <input
            type="number"
            name="unit_price"
            value={formData.unit_price}
            onChange={handleChange}
            placeholder="Unit Price"
            className="w-full p-2 border rounded"
            step="0.01"
            required
            disabled={isSubmitting}
          />
          <input
            type="number"
            name="sell_price"
            value={formData.sell_price}
            onChange={handleChange}
            placeholder="Sell Price"
            className="w-full p-2 border rounded"
            step="0.01"
            disabled={isSubmitting}
          />
          <input
            type="date"
            name="expire_date"
            value={formData.expire_date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              name="required_prescription"
              checked={formData.required_prescription}
              onChange={handleChange}
              className="mr-2"
              disabled={isSubmitting}
            />
            Requires Prescription
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
          <input
            type="file"
            name="Payment_file"
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="Details"
            className="w-full p-2 border rounded"
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

export default MedicineForm;
