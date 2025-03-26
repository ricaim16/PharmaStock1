// src/pages/CustomerManagement.jsx
import { Routes, Route } from "react-router-dom";
import CustomerList from "../components/CustomerList";
import Sidebar from "../components/Sidebar";

const CustomerManagement = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <Routes>
          <Route path="/" element={<CustomerList />} />
          <Route path="/customers" element={<CustomerList />} />
        </Routes>
      </div>
    </div>
  );
};

export default CustomerManagement;
