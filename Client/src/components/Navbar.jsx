import { useNavigate } from "react-router-dom";
import { logout, getUsername, getUserRole } from "../utils/auth";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ username, onProfileClick, onEmployeeProfileClick }) => {
  const navigate = useNavigate();
  const role = getUserRole();

  const handleLogout = () => {
    console.log("Logout button clicked");
    logout();
    console.log("After logout, localStorage:", localStorage);
    navigate("/");
  };

  const handleProfileClick = () => {
    if (role === "EMPLOYEE") {
      onEmployeeProfileClick(); // Trigger full-screen employee profile
    } else {
      onProfileClick(); // Trigger manager profile modal
    }
  };

  return (
    <div className="bg-gray-700 text-white p-4 flex justify-end items-center space-x-4">
      <span className="text-sm mr-2">{username || "User"}</span>
      <FaUserCircle
        className="text-2xl cursor-pointer hover:text-gray-300"
        onClick={handleProfileClick}
      />
      <button
        onClick={handleLogout}
        className="py-1 px-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
