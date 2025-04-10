import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Objectives from "../components/Objectives";
import KeyResults from "../components/KeyResults";
import OKRReport from "../components/OKRReport";

const OKRManagement = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 min-h-screen ml-64">
        <Routes>
          <Route path="objectives" element={<Objectives />} />
          <Route path="key-results" element={<KeyResults />} />
          <Route path="report" element={<OKRReport />} />
          <Route path="/" element={<Navigate to="objectives" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default OKRManagement;
