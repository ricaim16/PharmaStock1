// src/pages/SupplierCreditManagement.jsx
import { Routes, Route } from "react-router-dom";
import SupplierCreditList from "../components/SupplierCreditList";
import SupplierCreditReport from "../components/SupplierCreditReport";
import Sidebar from "../components/Sidebar";

const SupplierCreditManagement = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <Routes>
          <Route path="/" element={<SupplierCreditList />} />
          <Route path="/credits" element={<SupplierCreditList />} />
          <Route path="/credit-report" element={<SupplierCreditReport />} />
        </Routes>
      </div>
    </div>
  );
};

export default SupplierCreditManagement;
