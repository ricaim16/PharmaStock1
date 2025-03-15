import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MemberForm from "../components/MemberForm";
import MemberList from "../components/MemberList";
import { getToken, getUserRole } from "../utils/auth"; // Removed getAllUsers from here
import { getAllUsers } from "../api/userApi";

const MemberManagement = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
    } else if (role !== "MANAGER") {
      navigate("/dashboard");
    } else {
      const fetchUsers = async () => {
        try {
          const data = await getAllUsers();
          setUsers(data.users || []);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      };
      fetchUsers();
    }
  }, [navigate, role]);

  const handleMemberSaved = (newMember) => {
    console.log("Member saved:", newMember);
    setIsFormOpen(false);
    setSelectedMember(null);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedMember(null); // Reset selected member when closing
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Member Management
          </h1>
          <button
            onClick={() => {
              setSelectedMember(null);
              setIsFormOpen(true);
            }}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Create Member
          </button>
        </div>
        <MemberList onEdit={handleEdit} />
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
              {/* Optional: Keep this close button if you want it in the modal overlay */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
              <MemberForm
                member={selectedMember}
                onMemberSaved={handleMemberSaved}
                users={users}
                onClose={handleClose} // Pass the onClose prop to MemberForm
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagement;
