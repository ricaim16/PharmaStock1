import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getUserRole } from "../utils/auth";

const Sidebar = () => {
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/inventory-management", label: "Inventory Management" },
    { path: "/supplier-management", label: "Supplier Management" },
    { path: "/sales-management", label: "Sales Management" },
    { path: "/return-management", label: "Return Management" },
    { path: "/customer-management", label: "Customer Management" },
    { path: "/credit-management", label: "Credit Management" },
    ...(role === "MANAGER"
      ? [
          { path: "/expense-management", label: "Expense Management" },
          { path: "/member-management", label: "Member Management" },
          { path: "/user-management", label: "User Management" },
          { path: "/okr", label: "OKR" },
          { path: "/predictive-analysis", label: "Predictive Analysis" },
        ]
      : []),
    { path: "/notifications", label: "Notifications" },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4 fixed">
      <h2 className="text-xl font-bold mb-6">Menu</h2>
      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`block py-2 px-4 rounded hover:bg-gray-700 ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;