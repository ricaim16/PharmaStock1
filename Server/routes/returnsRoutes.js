// routes/returnsRoutes.js
import express from "express";
import { returnsController } from "../controllers/returnsController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", returnsController.getAllReturns);
router.get("/:id", returnsController.getReturnById);

// Protected routes (require authentication and specific roles)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  returnsController.addReturn
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  returnsController.editReturn
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  returnsController.deleteReturn
);

export default router;
