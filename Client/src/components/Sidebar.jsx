import { getUserRole, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const role = getUserRole() || "EMPLOYEE"; // Default to EMPLOYEE if no role
  const navigate = useNavigate();

  const managerMenu = [
    "Dashboard",
    "Inventory Management",
    "Supplier Management",
    "Sales Management",
    "Return Management",
    "Customer Management",
    "Credit Management",
    "Expense Management",
    "Member Management",
    "OKR",
    "Predictive Analysis",
    "Notifications",
    "User Management",
  ];

  const employeeMenu = [
    "Dashboard",
    "Inventory Management",
    "Supplier Management",
    "Sales Management",
    "Return Management",
    "Customer Management",
    "Credit Management",
    "Notifications",
  ];

  const menu = role === "MANAGER" ? managerMenu : employeeMenu;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">Menu</div>
      <ul className="mt-4 space-y-2 flex-1">
        {menu.map((item, index) => (
          <li
            key={index}
            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          >
            {item}
          </li>
        ))}
      </ul>
      <button
        onClick={handleLogout}
        className="m-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition duration-300"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
