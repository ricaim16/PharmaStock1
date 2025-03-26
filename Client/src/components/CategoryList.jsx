// src/components/CategoryList.jsx
import { useState, useEffect } from "react";
import { getAllCategories, deleteCategory } from "../api/categoryApi";
import CategoryForm from "./CategoryForm";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to fetch categories");
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        setError("Failed to delete category");
      }
    }
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600"
      >
        Add Category
      </button>
      {isFormOpen && (
        <CategoryForm
          category={selectedCategory}
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
          {categories.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-100">
              <td className="border p-2">{cat.name}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
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

export default CategoryList;
