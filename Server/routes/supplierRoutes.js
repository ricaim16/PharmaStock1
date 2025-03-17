import express from "express";
import { supplierController } from "../controllers/supplierController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Helper to get __dirname in ESM
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(
  __filename.startsWith("/") ? __filename.slice(1) : __filename
);

// Multer configuration (aligned with memberRoutes.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`Created uploads directory at: ${uploadPath}`);
      }
      cb(null, uploadPath);
    } catch (error) {
      console.error(
        `Error creating uploads directory at ${uploadPath}:`,
        error
      );
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // e.g., 1742130477191-photo.png
  },
});

const upload = multer({ storage });

// Supplier routes
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["MANAGER", "EMPLOYEE"]),
  supplierController.getAllSuppliers
);

router.post(
  "",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  upload.single("photo"), // Single photo upload
  supplierController.addSupplier
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  upload.single("photo"),
  supplierController.editSupplier
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  supplierController.deleteSupplier
);

// Supplier credit routes
router.post(
  "/credits",
  authMiddleware,
  roleMiddleware(["MANAGER", "EMPLOYEE"]),
  upload.single("payment_file"),
  supplierController.addSupplierCredit
);

router.put(
  "/credits/:id",
  authMiddleware,
  roleMiddleware(["MANAGER", "EMPLOYEE"]),
  upload.single("payment_file"),
  supplierController.editSupplierCredit
);

router.delete(
  "/credits/:id",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  supplierController.deleteSupplierCredit
);

router.get(
  "/credits/supplier/:supplier_id",
  authMiddleware,
  roleMiddleware(["MANAGER", "EMPLOYEE"]),
  supplierController.getSupplierCredits
);

router.get(
  "/credits/report",
  authMiddleware,
  roleMiddleware(["MANAGER", "EMPLOYEE"]),
  supplierController.generateCreditReport
);

export default router;
