import express from "express";
import { supplierController } from "../controllers/supplierController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Supplier routes
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["MANAGER", "EMPLOYEE"]),
  supplierController.getAllSuppliers
);

router.post(
  "", // Changed from "/" to "" to match /api/suppliers exactly
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  upload.single("photo"),
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
