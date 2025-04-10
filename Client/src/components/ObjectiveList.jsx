// src/components/ObjectiveList.jsx
import React from "react";

const ObjectiveList = ({ objectives, loading, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Current Objectives</h2>
      {loading ? (
        <p>Loading...</p>
      ) : objectives.length === 0 ? (
        <p>No objectives found</p>
      ) : (
        <div className="space-y-4">
          {objectives.map((obj) => (
            <div key={obj.id} className="border-b pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{obj.title}</h3>
                  <p className="text-gray-600">{obj.description}</p>
                  <p className="text-sm text-gray-500">
                    Time Period: {obj.time_period}
                  </p>
                  <p className="text-sm text-gray-500">
                    Progress: {obj.progress}%
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => onEdit(obj)}
                    className="py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(obj.id)}
                    className="py-1 px-3 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObjectiveList;
