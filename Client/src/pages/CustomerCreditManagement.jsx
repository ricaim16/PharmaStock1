// src/pages/CustomerCreditManagement.jsx
import { Routes, Route } from "react-router-dom";
import CustomerCreditList from "../components/CustomerCreditList";
import Sidebar from "../components/Sidebar";

const CustomerCreditManagement = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <Routes>
          <Route path="/" element={<CustomerCreditList />} />
          <Route path="/credits" element={<CustomerCreditList />} />
        </Routes>
      </div>
    </div>
  );
};

export default CustomerCreditManagement;
