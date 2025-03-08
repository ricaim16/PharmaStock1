import { useEffect, useState } from "react";
import { getAllMembers } from "../utils/auth";

const MemberProfile = () => {
  const [member, setMember] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        const data = await getAllMembers(); // Fetches the employee's own profile (filtered by user_id in backend)
        if (data.members && data.members.length > 0) {
          setMember(data.members[0]); // Employee should only see their own profile
        } else {
          setError("No member profile found.");
        }
      } catch (err) {
        setError("Failed to load member profile.");
      }
    };
    fetchMemberProfile();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  if (!member) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">My Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p>
            <strong>ID:</strong> {member.id}
          </p>
          <p>
            <strong>User ID:</strong> {member.user_id}
          </p>
          <p>
            <strong>First Name:</strong> {member.FirstName}
          </p>
          <p>
            <strong>Last Name:</strong> {member.LastName}
          </p>
          <p>
            <strong>Phone:</strong> {member.phone || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {member.role}
          </p>
          <p>
            <strong>Position:</strong> {member.position}
          </p>
          <p>
            <strong>Salary:</strong> {member.salary}
          </p>
        </div>
        <div>
          <p>
            <strong>Joining Date:</strong>{" "}
            {new Date(member.joining_date).toISOString().split("T")[0]}
          </p>
          <p>
            <strong>Status:</strong>
            <span
              className={
                member.status === "ACTIVE" ? "text-green-600" : "text-red-600"
              }
            >
              {member.status}
            </span>
          </p>
          <p>
            <strong>Gender:</strong> {member.gender || "N/A"}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {member.dob
              ? new Date(member.dob).toISOString().split("T")[0]
              : "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {member.address || "N/A"}
          </p>
          <p>
            <strong>Biography:</strong> {member.biography || "N/A"}
          </p>
          <p>
            <strong>Photo:</strong>{" "}
            {member.photo ? (
              <a
                href={`http://localhost:5000/uploads/${member.photo
                  .split("\\")
                  .pop()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Photo
              </a>
            ) : (
              "N/A"
            )}
          </p>
          <p>
            <strong>Certificate:</strong>{" "}
            {member.certificate ? (
              <a
                href={`http://localhost:5000/uploads/${member.certificate
                  .split("\\")
                  .pop()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Certificate
              </a>
            ) : (
              "N/A"
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
