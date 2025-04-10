import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import MemberManagement from "./pages/MemberManagement";
import SupplierManagement from "./pages/SupplierManagement";
import SupplierCreditManagement from "./pages/SupplierCreditManagement";
import SupplierCreditReport from "./components/SupplierCreditReport";
import InventoryManagement from "./pages/InventoryManagement";
import CustomerManagement from "./pages/CustomerManagement";
import CustomerCreditManagement from "./pages/CustomerCreditManagement";
import CreditReport from "./components/CreditReport";
import SalesManagement from "./pages/SalesManagement";
import ReturnsManagement from "./pages/ReturnsManagement";
import ExpenseManagement from "./pages/ExpenseManagement";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import OKRManagement from "./pages/OKRManagement";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member-management"
            element={
              <ProtectedRoute>
                <MemberManagement />
              </ProtectedRoute>
            }
          />
          {/* Supplier Management Routes */}
          <Route
            path="/supplier-management/*"
            element={
              <ProtectedRoute>
                <SupplierManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-management/credits"
            element={
              <ProtectedRoute>
                <SupplierCreditManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier-management/credit-report"
            element={
              <ProtectedRoute>
                <SupplierCreditReport />
              </ProtectedRoute>
            }
          />
          {/* Customer Management Routes */}
          <Route
            path="/customer-management/*"
            element={
              <ProtectedRoute>
                <CustomerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-management/credits"
            element={
              <ProtectedRoute>
                <CustomerCreditManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-management/credit-report"
            element={
              <ProtectedRoute>
                <CreditReport />
              </ProtectedRoute>
            }
          />
          {/* Other Management Routes */}
          <Route
            path="/inventory-management/*"
            element={
              <ProtectedRoute>
                <InventoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-management/*"
            element={
              <ProtectedRoute>
                <SalesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/returns-management/*"
            element={
              <ProtectedRoute>
                <ReturnsManagement />
              </ProtectedRoute>
            }
          />
          {/* Expense Management Routes */}
          <Route
            path="/expense-management/*"
            element={
              <ProtectedRoute allowedRoles={["PHARMACIST", "MANAGER"]}>
                <ExpenseManagement />
              </ProtectedRoute>
            }
          />
          {/* OKR Management Routes */}
          <Route
            path="/okr/*"
            element={
              <ProtectedRoute allowedRoles={["MANAGER"]}>
                <OKRManagement />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
