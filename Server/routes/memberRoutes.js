import express from "express";
import {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  updateSelfMember,
  getAllMembersIncludingInactive,
} from "../controllers/memberController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Helper to get __dirname in ESM
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(
  __filename.startsWith("/") ? __filename.slice(1) : __filename
);

const router = express.Router();

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

router.use(authMiddleware);

// Routes
router.put(
  "/self",
  upload.fields([{ name: "photo" }, { name: "certificate" }]),
  updateSelfMember
);

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

router.get("/", getAllMembers);
router.get("/all", getAllMembersIncludingInactive);
router.get("/:id", getMemberById);

export default router;
