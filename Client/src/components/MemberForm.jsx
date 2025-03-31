import { useState, useEffect } from "react";
import { createMember, updateMember, axiosInstance } from "../api/memberApi";

const MemberForm = ({ member, onMemberSaved, users, onClose }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    FirstName: "",
    LastName: "",
    phone: "",
    role: "",
    position: "",
    address: "",
    gender: "",
    dob: "",
    salary: "",
    joining_date: "",
    status: "",
    biography: "",
    certificate: null,
    photo: null,
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [submissionError, setSubmissionError] = useState("");

  const baseUrl = "http://localhost:5000/"; // Adjust based on your backend URL

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const allUsersResponse = await axiosInstance.get("/users");
        const allUsers = allUsersResponse.data.users || [];

        if (member) {
          const selectedUser = allUsers.find(
            (user) => user.id === member.user_id
          );
          const initializedFormData = {
            user_id: member.user_id || "",
            FirstName: member.FirstName || "",
            LastName: member.LastName || "",
            phone: member.phone || "",
            role: selectedUser ? selectedUser.role : member.role || "",
            position: member.position || "",
            address: member.address || "",
            gender: member.gender || "",
            dob: member.dob
              ? new Date(member.dob).toISOString().split("T")[0]
              : "",
            salary: member.salary || "",
            joining_date: member.joining_date
              ? new Date(member.joining_date).toISOString().split("T")[0]
              : "",
            status: selectedUser ? selectedUser.status : member.status || "",
            biography: member.biography || "", // Ensure biography is set
            certificate: null,
            photo: null,
          };
          setFormData(initializedFormData);
          setIsActive(selectedUser ? selectedUser.status === "ACTIVE" : true);
          console.log("Initialized formData:", initializedFormData);
        }

        const membersResponse = await axiosInstance.get("/members/all");
        const allMemberRecords = membersResponse.data || [];
        const allUserIds = allMemberRecords.map((m) => m.user_id);

        const filteredUsers = allUsers.filter(
          (user) => !allUserIds.includes(user.id)
        );
        setAvailableUsers(filteredUsers);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load available users."
        );
        setAvailableUsers([]);
      }
    };

    fetchAvailableUsers();
  }, [member]);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const selectedUser = availableUsers.find((user) => user.id === userId);
    setFormData((prev) => ({
      ...prev,
      user_id: userId,
      FirstName: selectedUser ? selectedUser.FirstName : "",
      LastName: selectedUser ? selectedUser.LastName : "",
      role: selectedUser ? selectedUser.role : "",
      status: selectedUser ? selectedUser.status : "",
    }));
    setIsActive(selectedUser ? selectedUser.status === "ACTIVE" : true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const fieldName = name === "photo" || name === "certificate" ? name : name;
    console.log("Field changed:", name, files ? files[0] : value);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmissionError("");

    if (!isActive) {
      setSubmissionError("User is inactive, so you can't edit this member.");
      setIsSubmitting(false);
      return;
    }

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value ?? ""); // Include empty values to allow clearing
    });
    console.log("Submission data:");
    for (let [key, value] of submissionData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      let response;
      if (member) {
        response = await updateMember(member.id, submissionData);
        console.log("Update response:", response);
      } else {
        response = await createMember(submissionData);
      }
      onMemberSaved(response.member || response);
      setFormData((prev) => ({
        ...prev,
        certificate: null,
        photo: null,
      }));
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save member");
      console.error("Submission error:", err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative w-full max-w-5xl mx-4 sm:mx-6 md:mx-8 lg:mx-auto">
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white rounded-lg shadow-lg w-full h-[80vh] sm:h-[85vh] md:h-[90vh] relative"
          encType="multipart/form-data"
        >
          <div className="sticky top-0 z-10 bg-white py-6 flex justify-between items-center border-b shadow-lg">
            <h2 className="text-xl font-bold text-center flex-1">
              {member ? "Edit Member" : "Create Member"}
            </h2>
            <div>
              <button
                onClick={onClose}
                aria-label="Close form"
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 mt-4">{error}</div>}
          {submissionError && (
            <div className="mt-4 flex justify-center items-center w-full h-[200px] border rounded overflow-hidden bg-red-50">
              <div className="text-center p-4">
                <svg
                  className="w-12 h-12 mx-auto text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2 text-lg font-semibold text-red-600">
                  {submissionError}
                </p>
              </div>
            </div>
          )}

          {!submissionError && (
            <div className="overflow-y-auto h-[calc(80vh-150px)] sm:h-[calc(85vh-150px)] md:h-[calc(90vh-150px)] pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {!member && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Select User
                    </p>
                    <select
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleUserChange}
                      className="w-full p-2 border rounded"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select User</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.FirstName} {user.LastName} ({user.username})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    First Name
                  </p>
                  <input
                    type="text"
                    name="FirstName"
                    value={formData.FirstName}
                    className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Name</p>
                  <input
                    type="text"
                    name="LastName"
                    value={formData.LastName}
                    className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    disabled={isSubmitting || !isActive}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Role</p>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Position</p>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    required
                    disabled={isSubmitting || !isActive}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    disabled={isSubmitting || !isActive}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Gender</p>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    disabled={isSubmitting || !isActive}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </p>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    disabled={isSubmitting || !isActive}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Salary</p>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    step="0.01"
                    required={!member}
                    disabled={isSubmitting || !isActive}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Joining Date
                  </p>
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    required={!member}
                    disabled={isSubmitting || !isActive}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <input
                    type="text"
                    name="status"
                    value={formData.status}
                    className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100"
                    disabled
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                  <p className="text-sm font-medium text-gray-700">Biography</p>
                  <textarea
                    name="biography"
                    value={formData.biography}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md h-24"
                    disabled={isSubmitting || !isActive}
                  />
                </div>
                <div className="col-span-1">
                  <p className="text-sm font-medium text-gray-700">
                    Certificate
                  </p>
                  <input
                    type="file"
                    name="certificate"
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    accept="image/jpeg,image/png,application/pdf"
                    disabled={isSubmitting || !isActive}
                  />
                  {member?.certificate && (
                    <div className="mt-2 flex justify-center items-center w-full h-[200px] overflow-hidden">
                      <img
                        src={`${baseUrl}${member.certificate
                          .split("\\")
                          .pop()}`}
                        alt="Certificate"
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          console.error("Failed to load certificate:", e);
                          e.target.src = "https://via.placeholder.com/150";
                          e.target.alt = "Failed to load certificate";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="col-span-1">
                  <p className="text-sm font-medium text-gray-700">Photo</p>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border rounded-md"
                    accept="image/jpeg,image/png"
                    disabled={isSubmitting || !isActive}
                  />
                  {member?.Photo && (
                    <div className="mt-2 flex justify-center items-center w-full h-[200px] overflow-hidden">
                      <img
                        src={`${baseUrl}${member.Photo.split("\\").pop()}`}
                        alt="Photo"
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          console.error("Failed to load photo:", e);
                          e.target.src = "https://via.placeholder.com/150";
                          e.target.alt = "Failed to load photo";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end space-x-4">
            <button
              type="submit"
              className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting || !isActive}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
