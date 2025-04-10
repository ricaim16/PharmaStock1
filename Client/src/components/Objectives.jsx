import React, { useState, useEffect } from "react";
import { getObjectives, createObjective, updateObjective, deleteObjective } from "../api/okrApi";
import ObjectiveForm from "./ObjectiveForm";
import ObjectiveList from "./ObjectiveList";

const Objectives = () => {
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState({
    title: "",
    description: "",
    time_period: "",
    progress: 0,
  });
  const [editingObjective, setEditingObjective] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const response = await getObjectives();
      setObjectives(response.data.data);
    } catch (err) {
      console.error("Error fetching objectives:", err);
      setError("Failed to fetch objectives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjectives();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewObjective((prev) => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value, 10) : value,
    }));
  };

  const handleCreateOrUpdateObjective = async (e) => {
    e.preventDefault();
    if (
      !newObjective.title ||
      !newObjective.description ||
      !newObjective.time_period ||
      newObjective.progress === undefined
    ) {
      setError("All fields are required.");
      return;
    }
    if (newObjective.progress < 0 || newObjective.progress > 100) {
      setError("Progress must be between 0 and 100.");
      return;
    }

    console.log("Sending objective data:", newObjective);
    try {
      setLoading(true);
      await (editingObjective
        ? updateObjective(editingObjective.id, newObjective)
        : createObjective(newObjective));
      await fetchObjectives();
      setNewObjective({
        title: "",
        description: "",
        time_period: "",
        progress: 0,
      });
      setEditingObjective(null);
    } catch (err) {
      console.error("Error saving objective:", err);
      setError("Failed to save objective");
    } finally {
      setLoading(false);
    }
  };

  const handleEditObjective = (objective) => {
    console.log("Editing objective:", objective);
    setEditingObjective(objective);
    setNewObjective(objective);
  };

  const handleDeleteObjective = async (id) => {
    if (window.confirm("Are you sure you want to delete this objective?")) {
      try {
        setLoading(true);
        await deleteObjective(id);
        await fetchObjectives();
      } catch (err) {
        console.error("Error deleting objective:", err);
        setError("Failed to delete objective");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Objectives</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <ObjectiveForm
        objective={newObjective}
        onSubmit={handleCreateOrUpdateObjective}
        onChange={handleChange}
        loading={loading}
      />
      <ObjectiveList
        objectives={objectives}
        loading={loading}
        onEdit={handleEditObjective}
        onDelete={handleDeleteObjective}
      />
    </div>
  );
};

export default Objectives;