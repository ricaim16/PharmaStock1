import express from "express";
import { salesController } from "../controllers/salesController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Sales Routes
router.get("/", roleMiddleware(["MANAGER", "EMPLOYEE"]), (req, res) => {
  console.log("GET /api/sales/ hit");
  salesController.getAllSales(req, res);
});

// Move /report before /:id to prevent route conflict
router.get("/report", roleMiddleware(["MANAGER", "EMPLOYEE"]), (req, res) => {
  console.log("GET /api/sales/report hit", req.query);
  salesController.generateSalesReport(req, res);
});

router.get("/:id", roleMiddleware(["MANAGER", "EMPLOYEE"]), (req, res) => {
  console.log(`GET /api/sales/${req.params.id} hit`);
  salesController.getSaleById(req, res);
});

router.post("/", roleMiddleware(["MANAGER", "EMPLOYEE"]), (req, res) => {
  console.log("POST /api/sales/ hit", req.body);
  salesController.addSale(req, res);
});

router.put("/:id", roleMiddleware(["MANAGER"]), (req, res) => {
  console.log(`PUT /api/sales/${req.params.id} hit`, req.body);
  salesController.editSale(req, res);
});

router.delete("/:id", roleMiddleware(["MANAGER"]), (req, res) => {
  console.log(`DELETE /api/sales/${req.params.id} hit`);
  salesController.deleteSale(req, res);
});

export default router;
