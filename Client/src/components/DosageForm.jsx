// src/components/DosageForm.jsx
import { useState, useEffect } from "react";
import { addDosageForm, editDosageForm } from "../api/dosageApi";

const DosageForm = ({ dosage, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dosage) setFormData(dosage);
  }, [dosage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dosage) {
        await editDosageForm(dosage.id, formData);
      } else {
        await addDosageForm(formData);
      }
      onSave();
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Failed to save dosage form"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded shadow"
    >
      {error && <div className="text-red-500">{error}</div>}
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Dosage Form Name"
        className="w-full p-2 border rounded"
        required
      />
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DosageForm;
