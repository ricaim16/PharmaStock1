import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getUserRole } from "../utils/auth";

const Sidebar = () => {
  const [role, setRole] = useState(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false); // Added
  const location = useLocation();

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    {
      path: "/inventory-management",
      label: "Inventory Management",
      hasDropdown: true,
      subItems: [
        { path: "/inventory-management/medicines", label: "Medicines" },
        { path: "/inventory-management/categories", label: "Categories" },
        { path: "/inventory-management/dosage-forms", label: "Dosage Forms" },
        { path: "/inventory-management/report", label: "Report" },
      ],
      isOpen: isInventoryOpen,
      setIsOpen: setIsInventoryOpen,
    },
    {
      path: "/supplier-management",
      label: "Supplier Management",
      hasDropdown: true,
      subItems: [
        { path: "/supplier-management/suppliers", label: "Supplier List" },
        { path: "/supplier-management/credits", label: "Supplier Credits" },
        { path: "/supplier-management/credit-report", label: "Credit Report" },
      ],
      isOpen: isSupplierOpen,
      setIsOpen: setIsSupplierOpen,
    },
    {
      path: "/sales-management",
      label: "Sales Management",
      hasDropdown: true,
      subItems: [
        { path: "/sales-management/sales", label: "Sales List" },
        { path: "/sales-management/report", label: "Sales Report" },
      ],
      isOpen: isSalesOpen,
      setIsOpen: setIsSalesOpen,
    },
    {
      path: "/returns-management",
      label: "Returns Management",
      hasDropdown: true,
      subItems: [
        { path: "/returns-management/returns", label: "Returns List" },
      ],
      isOpen: isReturnsOpen,
      setIsOpen: setIsReturnsOpen,
    },
    {
      path: "/customer-management",
      label: "Customer Management",
      hasDropdown: true,
      subItems: [
        { path: "/customer-management/customers", label: "Customer List" },
        { path: "/customer-management/credits", label: "Customer Credits" },
        { path: "/customer-management/credit-report", label: "Credit Report" },
      ],
      isOpen: isCustomerOpen,
      setIsOpen: setIsCustomerOpen,
    },
    ...(role === "MANAGER" || role === "PHARMACIST"
      ? [
          {
            path: "/expense-management",
            label: "Expense Management",
            hasDropdown: true,
            subItems: [
              
              { path: "/expense-management/list", label: "Expense List" },
              { path: "/expense-management/report", label: "Expense Report" },
            ],
            isOpen: isExpenseOpen,
            setIsOpen: setIsExpenseOpen,
          },
          ...(role === "MANAGER"
            ? [
                { path: "/member-management", label: "Member Management" },
                { path: "/user-management", label: "User Management" },
                { path: "/okr", label: "OKR" },
                { path: "/predictive-analysis", label: "Predictive Analysis" },
              ]
            : []),
        ]
      : []),
    { path: "/notifications", label: "Notifications" },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4 fixed">
      <h2 className="text-xl font-bold mb-6">Menu</h2>
      <nav>
        {menuItems.map((item) => (
          <div key={item.path}>
            {item.hasDropdown ? (
              <>
                <button
                  onClick={() => item.setIsOpen(!item.isOpen)}
                  className={`block py-2 px-4 rounded hover:bg-gray-700 w-full text-left ${
                    location.pathname.startsWith(item.path) ? "bg-gray-700" : ""
                  }`}
                >
                  {item.label} {item.isOpen ? "▲" : "▼"}
                </button>
                {item.isOpen && (
                  <div className="pl-4">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `block py-2 px-4 rounded hover:bg-gray-700 ${
                            isActive ? "bg-gray-700" : ""
                          }`
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block py-2 px-4 rounded hover:bg-gray-700 ${
                    isActive ? "bg-gray-700" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
