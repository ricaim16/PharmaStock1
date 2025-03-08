import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserForm from "../components/UserForm";
import UserList from "../components/UserList";
import { getToken, getUserRole } from "../utils/auth";

const UserManagement = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
    } else if (role !== "MANAGER") {
      navigate("/dashboard");
    }
  }, [navigate, role]);

  const handleUserCreated = (newUser) => {
    console.log("New user created:", newUser);
    setIsFormOpen(false);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Create User
          </button>
        </div>
        <UserList />
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
              <UserForm onUserCreated={handleUserCreated} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
