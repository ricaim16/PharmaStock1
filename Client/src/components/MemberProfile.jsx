import { useState, useEffect } from "react";
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
          console.log("MemberProfile member:", employeeProfile); // Debug log
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
            Photo: null, // Changed from photo to Photo
            certificate: null,
            username: localStorage.getItem("username") || "",
            password: "",
          });
        } else {
          setError("No member profile found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load member profile.");
        console.error("Fetch member profile error:", err);
      }
    };
    fetchMemberProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const fieldName = name === "Photo" ? "Photo" : name; // Changed from photo to Photo
    setFormData((prev) => ({
      ...prev,
      [fieldName]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "" && value !== undefined) {
        data.append(key, value);
      }
    });

    try {
      const response = await updateSelfMember(data);
      setMember(response.member);
      setFormData((prev) => ({
        ...prev,
        Photo: null, // Changed from photo to Photo
        certificate: null,
      }));
      setIsEditing(false);
      localStorage.setItem("username", formData.username);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
      console.error("Update self error:", err.response?.data || err);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  if (!member || !formData) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  const baseUrl = "http://localhost:5000/"; // Adjust based on your backend URL

  return (
    <div
      className={`${
        isFullScreen ? "fixed inset-0 bg-white p-4 overflow-auto" : "p-4"
      }`}
    >
      <h2 className="text-2xl font-bold mb-4">Member Profile</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Certificate
              </label>
              <input
                type="file"
                name="certificate"
                onChange={handleChange}
                className="w-full p-2 border rounded"
                accept="image/jpeg,image/png,application/pdf"
              />
              {member.certificate && (
                <div className="mt-2 w-48 h-48 overflow-hidden">
                  <img
                    src={`${baseUrl}${member.certificate}`}
                    alt="Certificate"
                    className="w-full h-full object-contain"
                    onError={(e) =>
                      console.error("Failed to load certificate:", e)
                    }
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Photo
              </label>
              <input
                type="file"
                name="Photo" // Changed from photo to Photo
                onChange={handleChange}
                className="w-full p-2 border rounded"
                accept="image/jpeg,image/png"
              />
              {member.Photo && ( // Changed from member.photo to member.Photo
                <div className="mt-2 w-48 h-48 overflow-hidden">
                  <img
                    src={`${baseUrl}${member.Photo}`} // Changed to member.Photo
                    alt="Photo"
                    className="w-full h-full object-contain"
                    onError={(e) => console.error("Failed to load photo:", e)}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleEditToggle}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
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
            <strong>Gender:</strong> {member.gender || "N/A"}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {member.dob ? new Date(member.dob).toLocaleDateString() : "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {member.address || "N/A"}
          </p>
          <p>
            <strong>Biography:</strong> {member.biography || "N/A"}
          </p>
          <div>
            <p>
              <strong>Certificate:</strong>
            </p>
            {member.certificate ? (
              <div className="mt-2 w-48 h-48 overflow-hidden">
                <img
                  src={`${baseUrl}${member.certificate}`}
                  alt="Certificate"
                  className="w-full h-full object-contain"
                  onError={(e) =>
                    console.error("Failed to load certificate:", e)
                  }
                />
              </div>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <div>
            <p>
              <strong>Photo:</strong>
            </p>
            {member.Photo ? ( // Changed from member.photo to member.Photo
              <div className="mt-2 w-48 h-48 overflow-hidden">
                <img
                  src={`${baseUrl}${member.Photo}`} // Changed to member.Photo
                  alt="Photo"
                  className="w-full h-full object-contain"
                  onError={(e) => console.error("Failed to load photo:", e)}
                />
              </div>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleEditToggle}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            {isFullScreen && onClose && (
              <button
                onClick={onClose}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
