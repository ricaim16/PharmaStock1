import React from "react";

const KeyResultForm = ({
  keyResult,
  onSubmit,
  onChange,
  loading,
  objectives,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {keyResult.id ? "Edit Key Result" : "Create New Key Result"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Objective ID (Dropdown) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Objective
          </label>
          <select
            name="objective_id"
            value={keyResult.objective_id || ""}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
            disabled={keyResult.id} // Disable if editing (objective_id shouldn't change)
          >
            <option value="">Select an Objective</option>
            {objectives &&
              objectives.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.title}
                </option>
              ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={keyResult.title || ""}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={keyResult.description || ""}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight (0 to 1)
          </label>
          <input
            type="number"
            name="weight"
            min="0"
            max="1"
            step="0.01"
            value={keyResult.weight || ""}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Deadline
          </label>
          <input
            type="date"
            name="deadline"
            value={keyResult.deadline ? keyResult.deadline.split("T")[0] : ""}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>

        {/* Progress */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Progress (0 to 100)
          </label>
          <input
            type="number"
            name="progress"
            min="0"
            max="100"
            step="1"
            value={keyResult.progress || ""}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : keyResult.id
            ? "Update Key Result"
            : "Create Key Result"}
        </button>
      </form>
    </div>
  );
};

export default KeyResultForm;
