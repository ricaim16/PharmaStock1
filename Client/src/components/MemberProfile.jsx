import { useEffect, useState } from "react";
import { getAllMembers, updateSelfMember } from "../api/memberApi";

const MemberProfile = ({ isFullScreen = false, onClose }) => {
  const [member, setMember] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      try {
        const data = await getAllMembers();
        if (data.members && data.members.length > 0) {
          const employeeProfile = data.members[0];
          setMember(employeeProfile);
          setFormData({
            FirstName: employeeProfile.FirstName || "",
            LastName: employeeProfile.LastName || "",
            phone: employeeProfile.phone || "",
            gender: employeeProfile.gender || "",
            dob: employeeProfile.dob
              ? new Date(employeeProfile.dob).toISOString().split("T")[0]
              : "",
            address: employeeProfile.address || "",
            biography: employeeProfile.biography || "",
            photo: null,
            certificate: null,
            username: localStorage.getItem("username") || "",
            password: "",
          });
        } else {
          setError("No member profile found.");
        }
      } catch (err) {
        setError("Failed to load member profile.");
      }
    };
    fetchMemberProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await updateSelfMember(data);
      setMember(response.member);
      setIsEditing(false);
      localStorage.setItem("username", formData.username); // Update username in localStorage
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  if (!member || !formData) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  const containerClass = isFullScreen
    ? "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    : "max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg";

  return (
    <div className={containerClass}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-4xl relative">
        {isFullScreen && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
          >
            ✕
          </button>
        )}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleEditToggle}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </button>
          <h2 className="text-2xl font-bold text-center flex-1">My Profile</h2>
        </div>

        {isEditing ? (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-4xl h-[90vh] relative">
              <button
                onClick={handleEditToggle}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center">
                Edit Profile
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-red-500">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="FirstName"
                      value={formData.FirstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="LastName"
                      value={formData.LastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Biography
                    </label>
                    <textarea
                      name="biography"
                      value={formData.biography}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Photo
                    </label>
                    <input
                      type="file"
                      name="photo"
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {member.photo && (
                      <a
                        href={`http://localhost:5000/uploads/${member.photo
                          .split("\\")
                          .pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 mt-2 block"
                      >
                        View Current Photo
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Certificate
                    </label>
                    <input
                      type="file"
                      name="certificate"
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {member.certificate && (
                      <a
                        href={`http://localhost:5000/uploads/${member.certificate
                          .split("\\")
                          .pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 mt-2 block"
                      >
                        View Current Certificate
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p>
                <strong>Username:</strong> {formData.username}
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
            <div className="space-y-2">
              <p>
                <strong>Joining Date:</strong>{" "}
                {new Date(member.joining_date).toISOString().split("T")[0]}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    member.status === "ACTIVE"
                      ? "text-green-600"
                      : "text-red-600"
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
                    className="text-blue-600"
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
                    className="text-blue-600"
                  >
                    View Certificate
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;
