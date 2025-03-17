const SupplierDetailsModal = ({ supplier, onClose, onEdit }) => {
  const photoUrl = supplier.photo
    ? `http://localhost:5000/${supplier.photo.replace(
        /\\/g,
        "/"
      )}?t=${Date.now()}`
    : null;

  console.log("Supplier Photo URL:", photoUrl); // Debug

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold">Supplier Details</h2>
        <div className="space-y-2">
          <p>
            <strong>ID:</strong> {supplier.id}
          </p>
          <p>
            <strong>Name:</strong> {supplier.supplier_name}
          </p>
          <p>
            <strong>Contact Info:</strong> {supplier.contact_info || "N/A"}
          </p>
          <p>
            <strong>Location:</strong> {supplier.location || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {supplier.email || "N/A"}
          </p>
          <p>
            <strong>CBE Payment Info:</strong>{" "}
            {supplier.payment_info_cbe || "N/A"}
          </p>
          <p>
            <strong>Coop Payment Info:</strong>{" "}
            {supplier.payment_info_coop || "N/A"}
          </p>
          <p>
            <strong>BOA Payment Info:</strong>{" "}
            {supplier.payment_info_boa || "N/A"}
          </p>
          <p>
            <strong>Awash Payment Info:</strong>{" "}
            {supplier.payment_info_awash || "N/A"}
          </p>
          <p>
            <strong>eBirr Payment Info:</strong>{" "}
            {supplier.payment_info_ebirr || "N/A"}
          </p>
          <p>
            <strong>Photo:</strong>{" "}
            {supplier.photo ? (
              <div className="mt-2">
                <img
                  src={photoUrl}
                  alt={supplier.supplier_name}
                  className="w-32 h-32 object-cover rounded"
                  onError={(e) => {
                    console.error(`Failed to load image: ${supplier.photo}`);
                    console.log("Attempted URL:", e.target.src); // Debug
                    e.target.src = "/images/fallback-image.jpg"; // Adjust path
                  }}
                />
                <a
                  href={photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block mt-2"
                >
                  View Full Size
                </a>
              </div>
            ) : (
              "No photo available"
            )}
          </p>
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(supplier)}
            className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default SupplierDetailsModal;
