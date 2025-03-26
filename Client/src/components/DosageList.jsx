// src/components/DosageList.jsx
import { useState, useEffect } from "react";
import { getAllDosageForms, deleteDosageForm } from "../api/dosageApi";
import DosageForm from "./DosageForm";

const DosageList = () => {
  const [dosageForms, setDosageForms] = useState([]);
  const [selectedDosage, setSelectedDosage] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDosageForms();
  }, []);

  const fetchDosageForms = async () => {
    try {
      const data = await getAllDosageForms();
      setDosageForms(data);
    } catch (err) {
      setError("Failed to fetch dosage forms");
    }
  };

  const handleEdit = (dosage) => {
    setSelectedDosage(dosage);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this dosage form?")) {
      try {
        await deleteDosageForm(id);
        fetchDosageForms();
      } catch (err) {
        setError("Failed to delete dosage form");
      }
    }
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setSelectedDosage(null);
    fetchDosageForms();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dosage Forms</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600"
      >
        Add Dosage Form
      </button>
      {isFormOpen && (
        <DosageForm
          dosage={selectedDosage}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dosageForms.map((dos) => (
            <tr key={dos.id} className="hover:bg-gray-100">
              <td className="border p-2">{dos.name}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(dos)}
                  className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dos.id)}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DosageList;
