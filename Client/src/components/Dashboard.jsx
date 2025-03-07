import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getToken, getUserRole } from "../utils/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const role = getUserRole() || "EMPLOYEE";

  useEffect(() => {
    if (!getToken()) {
      navigate("/"); // Redirect to login if no token
    }
  }, [navigate]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold">Welcome, {role.toLowerCase()}!</h1>
        <p className="mt-4 text-gray-600">
          This is your dashboard content area.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
