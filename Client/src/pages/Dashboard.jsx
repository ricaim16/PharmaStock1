import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProfileModal from "../components/ProfileModal";
import MemberProfile from "../components/MemberProfile";
import { getToken, getUsername, getUserId, getUserRole } from "../utils/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const username = getUsername() || "User";
  const userId = getUserId();
  const role = getUserRole();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEmployeeProfileOpen, setIsEmployeeProfileOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
    }
  }, [navigate]);

  const handleEmployeeProfileClose = () => {
    setIsEmployeeProfileOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        username={username}
        onProfileClick={() => setIsProfileOpen(true)}
        onEmployeeProfileClick={() => setIsEmployeeProfileOpen(true)}
      />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          {role === "EMPLOYEE" ? (
            <p className="text-gray-600">
              Welcome to your dashboard, {username}!
            </p>
          ) : (
            <p className="text-gray-600">
              This is your dashboard content area.
            </p>
          )}
          {isProfileOpen && role === "MANAGER" && (
            <ProfileModal
              userId={userId}
              onClose={() => setIsProfileOpen(false)}
            />
          )}
          {isEmployeeProfileOpen && role === "EMPLOYEE" && (
            <MemberProfile
              isFullScreen={true}
              onClose={handleEmployeeProfileClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
