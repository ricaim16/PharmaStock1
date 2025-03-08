import { useState } from "react";

const MemberDetailsModal = ({ member, onClose }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!member) return null;

  // Fallback for API_URL (replace with your env variable in production)
  const API_URL = "http://localhost:5000";

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] max-w-5xl h-[90vh] relative">
        {/* Sticky Header */}
        <div className="sticky top-0 z-100 bg-white py-6 flex justify-between items-center border-b shadow-lg">
          <h2 id="modal-title" className="text-xl font-bold text-center flex-1">
            Member Details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(90vh-150px)] pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">ID</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">User ID</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.user_id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">First Name</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.FirstName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Last Name</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.LastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.phone || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Role</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.role}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Position</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.position}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Salary</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.salary}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Address</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.address || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Joining Date</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {new Date(member.joining_date).toISOString().split("T")[0]}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Status</p>
              <p
                className={`w-full px-4 py-2 mt-1 border rounded-md bg-gray-100 ${
                  member.status === "ACTIVE" ? "text-green-600" : "text-red-600"
                }`}
              >
                {member.status}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Gender</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Date of Birth</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                {member.dob
                  ? new Date(member.dob).toISOString().split("T")[0]
                  : "N/A"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-700">Biography</p>
              <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100 h-24">
                {member.biography || "N/A"}
              </p>
            </div>
            <div className="col-span-1">
              <p className="text-sm font-medium text-gray-700">Certificate</p>
              {member.certificate ? (
                <div className="mt-2 flex justify-center items-center w-full h-[200px] overflow-hidden">
                  <img
                    src={`${API_URL}/uploads/${member.certificate
                      .split("\\")
                      .pop()}`}
                    alt="Certificate"
                    className="max-w-full max-h-full object-contain rounded cursor-pointer"
                    onClick={() =>
                      openImageModal(
                        `${API_URL}/uploads/${member.certificate
                          .split("\\")
                          .pop()}`
                      )
                    }
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.target.src = "https://via.placeholder.com/150";
                      e.target.alt = "Failed to load certificate";
                    }}
                  />
                </div>
              ) : (
                <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                  N/A
                </p>
              )}
            </div>
            <div className="col-span-1">
              <p className="text-sm font-medium text-gray-700">Photo</p>
              {member.photo ? (
                <div className="mt-2 flex justify-center items-center w-full h-[200px] overflow-hidden">
                  <img
                    src={`${API_URL}/uploads/${member.photo.split("\\").pop()}`}
                    alt="Member Photo"
                    className="max-w-full max-h-full object-contain rounded cursor-pointer"
                    onClick={() =>
                      openImageModal(
                        `${API_URL}/uploads/${member.photo.split("\\").pop()}`
                      )
                    }
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.target.src = "https://via.placeholder.com/150";
                      e.target.alt = "Failed to load photo";
                    }}
                  />
                </div>
              ) : (
                <p className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100">
                  N/A
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-70 flex items-center justify-center z-60">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl max-h-full overflow-hidden relative">
            <img
              src={selectedImage}
              alt="Full Size"
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl font-bold"
            >
              ✕
            </button>
            <button
              onClick={closeImageModal}
              className="absolute top-2 left-2 text-gray-600 hover:text-gray-800 text-2xl font-bold"
              aria-label="Back to Member Details"
            >
              ←
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetailsModal;
