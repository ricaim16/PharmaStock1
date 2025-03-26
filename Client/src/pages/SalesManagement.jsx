import { Routes, Route } from "react-router-dom";
import SaleList from "../components/SaleList";
import SalesReport from "../components/SalesReport";
import Sidebar from "../components/Sidebar";

const SalesManagement = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64">
        <Routes>
          <Route path="/" element={<SaleList />} />
          <Route path="/sales" element={<SaleList />} />
          <Route path="/report" element={<SalesReport />} />
        </Routes>
      </div>
    </div>
  );
};

export default SalesManagement;
