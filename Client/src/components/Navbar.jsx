// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { logout, getUsername } from "../utils/auth";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({ username, onProfileClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logout button clicked");
    logout();
    console.log("After logout, localStorage:", localStorage);
    navigate("/");
  };

  return (
    <div className="bg-gray-700 text-white p-4 flex justify-end items-center space-x-4">
      <span className="text-sm mr-2">{username || "User"}</span>
      <FaUserCircle
        className="text-2xl cursor-pointer hover:text-gray-300"
        onClick={onProfileClick}
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
