import { useState, useEffect } from "react";
import { createMember, updateMember } from "../api/memberApi";

const MemberForm = ({ member, onMemberSaved, users, onClose }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    FirstName: "",
    LastName: "",
    phone: "",
    role: "EMPLOYEE",
    position: "",
    salary: "",
    joining_date: "",
    status: "ACTIVE",
    address: "",
    certificate: null,
    photo: null,
    gender: "",
    dob: "",
    biography: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        user_id: member.user_id || "",
        FirstName: member.FirstName || "",
        LastName: member.LastName || "",
        phone: member.phone || "",
        role: member.role || "EMPLOYEE",
        position: member.position || "",
        salary: member.salary || "",
        joining_date: member.joining_date
          ? new Date(member.joining_date).toISOString().split("T")[0]
          : "",
        status: member.status || "ACTIVE",
        address: member.address || "",
        certificate: null,
        photo: null,
        gender: member.gender || "",
        dob: member.dob ? new Date(member.dob).toISOString().split("T")[0] : "",
        biography: member.biography || "",
      });
    } else {
      setFormData({
        user_id: "",
        FirstName: "",
        LastName: "",
        phone: "",
        role: "EMPLOYEE",
        position: "",
        salary: "",
        joining_date: "",
        status: "ACTIVE",
        address: "",
        certificate: null,
        photo: null,
        gender: "",
        dob: "",
        biography: "",
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = {
      user_id: formData.user_id,
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      role: formData.role,
      position: formData.position,
      salary: formData.salary,
      joining_date: formData.joining_date,
      status: formData.status,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key]
    );
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        if (key === "certificate" || key === "photo") {
          if (formData[key] instanceof File) {
            data.append(key, formData[key]);
          }
        } else {
          data.append(key, formData[key]);
        }
      }
    });

    try {
      let response;
      if (member) {
        response = await updateMember(member.id, data);
      } else {
        response = await createMember(data);
      }
      setError("");
      onMemberSaved(response.member);
      if (onClose) onClose(); // Close the form immediately without alert
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save member");
    } finally {
      setLoading(false);
    }
  };

  // Debugging log to check if onClose is provided
  useEffect(() => {
    console.log("onClose prop:", onClose);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-5xl relative">
        {/* Header with Title and Close Button */}
        <div className="sticky top-0 z-[100] bg-white py-4 flex justify-between items-center border-b shadow-lg px-4">
          <h2 className="text-xl font-bold text-center flex-1">
            {member ? "Update Member" : "Create New Member"}
          </h2>
          <button
            onClick={onClose || (() => {})}
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {/* Scrollable Content */}
        {error && <p className="text-red-500 mb-4 pt-6">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pt-16 p-2">
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!member}
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
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
                  required
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
                  required
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
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Salary
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                  Certificate
                </label>
                <input
                  type="file"
                  name="certificate"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {member?.certificate && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      Current: {member.certificate}
                    </p>
                    <img
                      src={`http://localhost:5000/uploads/${member.certificate
                        .split("\\")
                        .pop()}`}
                      alt="Current Certificate"
                      className="mt-2 max-w-xs h-auto"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                        e.target.alt = "Failed to load certificate";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Joining Date
                </label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Photo
                </label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {member?.photo && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      Current: {member.photo}
                    </p>
                    <img
                      src={`http://localhost:5000/uploads/${member.photo
                        .split("\\")
                        .pop()}`}
                      alt="Current Photo"
                      className="mt-2 max-w-xs h-auto"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                        e.target.alt = "Failed to load photo";
                      }}
                    />
                  </div>
                )}
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
                  Biography
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4"
            disabled={loading}
          >
            {loading ? "Saving..." : member ? "Update Member" : "Create Member"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;