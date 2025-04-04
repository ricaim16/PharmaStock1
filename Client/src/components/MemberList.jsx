import { useState, useEffect } from "react";
import { getAllMembers, deleteMember } from "../api/memberApi";
import MemberDetailsModal from "./MemberDetailsModal";

const MemberList = ({ onEdit }) => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = async () => {
    try {
      const data = await getAllMembers();
      console.log("Fetched members:", data);
      setMembers(data.members || []);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err);
      setError(err.response?.data?.error || "Failed to fetch members");
    }
  };

  const handleDelete = async (id) => {
    console.log("Delete clicked for ID:", id);
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const response = await deleteMember(id);
        console.log("Delete response:", response);
        await fetchMembers();
        setError("");
      } catch (err) {
        console.error("Delete error:", err.response?.data || err);
        setError(err.response?.data?.error || "Failed to delete member");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token on load:", token);
    if (!token) {
      setError("Please log in to view members.");
      return;
    }
    fetchMembers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full">
      <h2 className="text-xl font-bold mb-4">Member List</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!error && members.length === 0 && (
        <p className="text-gray-500 mb-4">No members found.</p>
      )}
      {members.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">First Name</th>
                <th className="py-2 px-4 border-b">Last Name</th>
                <th className="py-2 px-4 border-b">Phone</th>
                <th className="py-2 px-4 border-b">Salary</th>
                <th className="py-2 px-4 border-b">Joining Date</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="py-2 px-4 border-b">{member.FirstName}</td>
                  <td className="py-2 px-4 border-b">{member.LastName}</td>
                  <td className="py-2 px-4 border-b">
                    {member.phone || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">{member.salary}</td>
                  <td className="py-2 px-4 border-b">
                    {member.joining_date
                      ? new Date(member.joining_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-sm ${
                        member.status === "ACTIVE"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(member)}
                      className="py-1 px-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="py-1 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default MemberList;
