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

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Employee self-update route
router.put("/self", updateSelfMember);

// Manager-only routes
router.post("/", roleMiddleware(["MANAGER"]), createMember);
router.put("/:id", roleMiddleware(["MANAGER"]), updateMember);
router.delete("/:id", roleMiddleware(["MANAGER"]), deleteMember);


// Accessible to both Manager and Employee
router.get("/", getAllMembers);
router.get("/:id", getMemberById);

export default router;
