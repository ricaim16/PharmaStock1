import express from "express";
import {
  createObjective,
  getObjectives,
  getObjective,
  updateObjective,
  deleteObjective,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult,
  getKeyResults,
  generateOKRReport,
} from "../controllers/objectiveController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Objective Routes
router.post("/", authMiddleware, roleMiddleware(["MANAGER"]), (req, res) => {
  console.log("POST /api/objectives hit", req.body);
  createObjective(req, res);
});

router.get("/", authMiddleware, roleMiddleware(["MANAGER"]), (req, res) => {
  console.log("GET /api/objectives hit");
  getObjectives(req, res);
});

// KeyResult Routes
router.get("/key-results", (req, res) => {
  console.log("GET /api/objectives/key-results route triggered");
  getKeyResults(req, res);
});

router.post(
  "/key-results",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  (req, res) => {
    console.log("POST /api/objectives/key-results route triggered", req.body);
    createKeyResult(req, res);
  }
);

router.put(
  "/key-results/:id",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  (req, res) => {
    console.log(
      `PUT /api/objectives/key-results/${req.params.id} hit`,
      req.body
    );
    updateKeyResult(req, res);
  }
);

router.delete(
  "/key-results/:id",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  (req, res) => {
    console.log(`DELETE /api/objectives/key-results/${req.params.id} hit`);
    deleteKeyResult(req, res);
  }
);

// OKR Report Route
router.get(
  "/okr-report",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  (req, res) => {
    console.log("GET /api/okr-report hit", req.query);
    generateOKRReport(req, res);
  }
);

// Objective Routes with :id
router.get("/:id", authMiddleware, roleMiddleware(["MANAGER"]), (req, res) => {
  console.log(`GET /api/objectives/${req.params.id} hit`);
  getObjective(req, res);
});

router.put("/:id", authMiddleware, roleMiddleware(["MANAGER"]), (req, res) => {
  console.log(`PUT /api/objectives/${req.params.id} hit`, req.body);
  updateObjective(req, res);
});

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["MANAGER"]),
  (req, res) => {
    console.log(`DELETE /api/objectives/${req.params.id} hit`);
    deleteObjective(req, res);
  }
);

export default router;
