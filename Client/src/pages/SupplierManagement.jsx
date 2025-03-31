// src/pages/SupplierManagement.jsx
import { Routes, Route } from "react-router-dom";
import SupplierList from "../components/SupplierList";
import Sidebar from "../components/Sidebar";

const SupplierManagement = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <Routes>
          <Route path="/" element={<SupplierList />} />
          <Route path="/suppliers" element={<SupplierList />} />
        </Routes>
      </div>
    </div>
  );
};

export default SupplierManagement;
