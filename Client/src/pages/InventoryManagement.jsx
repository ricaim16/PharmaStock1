import { Routes, Route, Navigate } from "react-router-dom";
import Medicines from "./Medicines";
import CategoryList from "../components/CategoryList";
import DosageList from "../components/DosageList";
import MedicineReport from "../components/MedicineReport";

const InventoryManagement = () => {
  return (
    <div className="flex">
      <div className="flex-1 p-4 min-h-screen">
        <Routes>
          <Route path="medicines" element={<Medicines />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="dosage-forms" element={<DosageList />} />
          <Route path="report" element={<MedicineReport />} />
          <Route path="/" element={<Navigate to="medicines" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default InventoryManagement;
