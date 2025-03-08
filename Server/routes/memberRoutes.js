import express from "express";
import {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  updateSelfMember,
} from "../controllers/memberController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Helper to get __dirname in ESM
const __filename = new URL(import.meta.url).pathname;
// On Windows, the pathname starts with a leading '/', e.g., '/C:/...'. Remove it to get a valid path.
const __dirname = path.dirname(
  __filename.startsWith("/") ? __filename.slice(1) : __filename
);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads"); // Resolve to Server/uploads
    // Create uploads directory if it doesn't exist
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
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});
const upload = multer({ storage });

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Employee self-update route with file upload
router.put(
  "/self",
  upload.fields([{ name: "photo" }, { name: "certificate" }]),
  updateSelfMember
);

// Manager-only routes with file upload
router.post(
  "/",
  upload.fields([{ name: "photo" }, { name: "certificate" }]),
  roleMiddleware(["MANAGER"]),
  createMember
);
router.put(
  "/:id",
  upload.fields([{ name: "photo" }, { name: "certificate" }]),
  roleMiddleware(["MANAGER"]),
  updateMember
);
router.delete("/:id", roleMiddleware(["MANAGER"]), deleteMember);

// Accessible to both Manager and Employee
router.get("/", getAllMembers);
router.get("/:id", getMemberById);

export default router;
