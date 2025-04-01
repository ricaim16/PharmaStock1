import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import ReturnsList from "../components/ReturnsList";
import Sidebar from "../components/Sidebar";

const ReturnsManagement = () => {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-gray-100 pl-72 pr-4 pt-4">
          <div className="p-6">
            <Routes>
              <Route path="returns" element={<ReturnsList />} />
              {/* Add more nested routes here in the future, e.g., <Route path="report" element={<ReturnsReport />} /> */}
            </Routes>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ReturnsManagement;
