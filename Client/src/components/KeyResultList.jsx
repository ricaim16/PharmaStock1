import React from "react";

const KeyResultList = ({ keyResults, loading, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Current Key Results</h2>
      {loading ? (
        <p>Loading...</p>
      ) : keyResults.length === 0 ? (
        <p>No key results found</p>
      ) : (
        <div className="space-y-4">
          {keyResults.map((kr) => (
            <div key={kr.id} className="border-b pb-4">
              <h3 className="text-lg font-medium">{kr.title}</h3>
              <p className="text-gray-600">{kr.description}</p>
              <p className="text-sm text-gray-500">
                Objective ID: {kr.objective_id}
              </p>
              <p className="text-sm text-gray-500">Weight: {kr.weight}</p>
              <p className="text-sm text-gray-500">
                Deadline: {new Date(kr.deadline).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">Progress: {kr.progress}%</p>
              <div className="space-x-2">
                <button
                  onClick={() => onEdit(kr)}
                  className="py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(kr.id)}
                  className="py-1 px-3 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeyResultList;
