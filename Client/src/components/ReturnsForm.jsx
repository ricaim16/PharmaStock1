// src/components/ReturnsForm.jsx
import React, { useState, useEffect } from "react";
import returnsApi from "../api/returnsApi";
import { getAllMedicines } from "../api/medicineApi"; // Change to named import
import { getAllDosageForms } from "../api/dosageApi"; // Already fixed

const ReturnsForm = ({ returnData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    medicine_id: "",
    dosage_form_id: "",
    quantity: "",
    reason_for_return: "",
    product_name: "",
    product_batch_number: "",
  });
  const [medicines, setMedicines] = useState([]);
  const [dosageForms, setDosageForms] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (returnData) {
      setFormData(returnData);
    }
    fetchMedicines();
    fetchDosageForms();
  }, [returnData]);

  const fetchMedicines = async () => {
    try {
      const data = await getAllMedicines(); // Use the named function directly
      setMedicines(data);
    } catch (err) {
      setError(err.message || "Error fetching medicines");
    }
  };

  const fetchDosageForms = async () => {
    try {
      const data = await getAllDosageForms();
      setDosageForms(data);
    } catch (err) {
      setError(err.message || "Error fetching dosage forms");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (returnData?.id) {
        await returnsApi.updateReturn(returnData.id, formData);
      } else {
        await returnsApi.addReturn(formData);
      }
      onSave();
    } catch (err) {
      setError(err.message || "Error saving return");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {returnData ? "Edit Return" : "Add Return"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Medicine</label>
            <select
              name="medicine_id"
              value={formData.medicine_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Medicine</option>
              {medicines.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.medicine_name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Dosage Form
            </label>
            <select
              name="dosage_form_id"
              value={formData.dosage_form_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Dosage Form</option>
              {dosageForms.map((df) => (
                <option key={df.id} value={df.id}>
                  {df.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min="1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              name="reason_for_return"
              value={formData.reason_for_return}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Batch Number
            </label>
            <input
              type="text"
              name="product_batch_number"
              value={formData.product_batch_number}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnsForm;
