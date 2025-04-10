import React, { useState, useEffect } from "react";
import {
  getKeyResults,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult,
  getObjectives, // Add this to fetch objectives
} from "../api/okrApi";
import KeyResultForm from "./KeyResultForm";
import KeyResultList from "./KeyResultList";

const KeyResults = () => {
  const [keyResults, setKeyResults] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [newKeyResult, setNewKeyResult] = useState({
    objective_id: "",
    title: "",
    description: "",
    weight: "",
    deadline: "",
    progress: "",
  });
  const [editingKeyResult, setEditingKeyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch key results and objectives on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [keyResultsResponse, objectivesResponse] = await Promise.all([
          getKeyResults(),
          getObjectives(),
        ]);
        setKeyResults(keyResultsResponse.data.data);
        setObjectives(objectivesResponse.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewKeyResult((prev) => ({
      ...prev,
      [name]:
        name === "weight" || name === "progress"
          ? parseFloat(value) || ""
          : value,
    }));
  };

  const handleCreateOrUpdateKeyResult = async (e) => {
    e.preventDefault();
    const { objective_id, title, description, weight, deadline, progress } =
      newKeyResult;

    // Client-side validation
    if (
      !objective_id ||
      !title ||
      !description ||
      !deadline ||
      progress === "" ||
      weight === ""
    ) {
      setError("All fields are required.");
      return;
    }
    if (weight < 0 || weight > 1) {
      setError("Weight must be between 0 and 1.");
      return;
    }
    if (progress < 0 || progress > 100) {
      setError("Progress must be between 0 and 100.");
      return;
    }

    console.log("Sending key result data:", newKeyResult);
    try {
      setLoading(true);
      await (editingKeyResult
        ? updateKeyResult(editingKeyResult.id, newKeyResult)
        : createKeyResult(newKeyResult));
      setNewKeyResult({
        objective_id: "",
        title: "",
        description: "",
        weight: "",
        deadline: "",
        progress: "",
      });
      setEditingKeyResult(null);
      const response = await getKeyResults();
      setKeyResults(response.data.data);
    } catch (err) {
      console.error("Error saving key result:", err.response?.data || err);
      setError(err.response?.data?.error || "Failed to save key result");
    } finally {
      setLoading(false);
    }
  };

  const handleEditKeyResult = (keyResult) => {
    console.log("Editing key result:", keyResult);
    setEditingKeyResult(keyResult);
    setNewKeyResult({
      objective_id: keyResult.objective_id,
      title: keyResult.title,
      description: keyResult.description,
      weight: keyResult.weight,
      deadline: keyResult.deadline.split("T")[0], // Format for date input
      progress: keyResult.progress,
    });
  };

  const handleDeleteKeyResult = async (id) => {
    if (window.confirm("Are you sure you want to delete this key result?")) {
      try {
        setLoading(true);
        await deleteKeyResult(id);
        const response = await getKeyResults();
        setKeyResults(response.data.data);
      } catch (err) {
        console.error("Error deleting key result:", err.response?.data || err);
        setError(err.response?.data?.error || "Failed to delete key result");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Key Results</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <KeyResultForm
        keyResult={newKeyResult}
        onSubmit={handleCreateOrUpdateKeyResult}
        onChange={handleChange}
        loading={loading}
        objectives={objectives}
      />
      <KeyResultList
        keyResults={keyResults}
        loading={loading}
        onEdit={handleEditKeyResult}
        onDelete={handleDeleteKeyResult}
      />
    </div>
  );
};

export default KeyResults;
