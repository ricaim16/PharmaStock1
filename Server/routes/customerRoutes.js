import express from "express";
import { customerController } from "../controllers/customerController.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(
  __filename.startsWith("/") ? __filename.slice(1) : __filename
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.use(authMiddleware);

// Customer Routes
router.get("/", roleMiddleware(["MANAGER", "EMPLOYEE"]), (req, res) => {
  console.log("GET /api/customers/ hit");
  customerController.getAllCustomers(req, res);
});

router.get("/:id", roleMiddleware(["MANAGER", "EMPLOYEE"]), (req, res) => {
  console.log(`GET /api/customers/${req.params.id} hit`);
  customerController.getCustomerById(req, res);
});

router.post(
  "/",
  roleMiddleware(["MANAGER", "EMPLOYEE"]),
  customerController.addCustomer
);
router.put(
  "/:id",
  roleMiddleware(["MANAGER"]),
  customerController.editCustomer
);
router.delete(
  "/:id",
  roleMiddleware(["MANAGER"]),
  customerController.deleteCustomer
);

// Customer Credit Routes
router.get("/credits", roleMiddleware(["MANAGER", "EMPLOYEE"]), (req, res) => {
  console.log("GET /api/customers/credits hit");
  customerController.getAllCustomerCredits(req, res);
});

router.get(
  "/:customer_id/credits",
  roleMiddleware(["MANAGER", "EMPLOYEE"]),
  (req, res) => {
    console.log(`GET /api/customers/${req.params.customer_id}/credits hit`);
    customerController.getCustomerCredits(req, res);
  }
);

router.get(
  "/credits/report",
  roleMiddleware(["MANAGER"]),
  customerController.generateCreditReport
);

router.post(
  "/credits",
  roleMiddleware(["MANAGER"]),
  upload.single("payment_file"),
  (req, res) => {
    console.log("POST /api/customers/credits hit", {
      body: req.body,
      file: req.file,
    });
    customerController.addCustomerCredit(req, res);
  }
);

router.put(
  "/credits/:id",
  roleMiddleware(["MANAGER"]),
  upload.single("payment_file"),
  customerController.editCustomerCredit
);
router.delete(
  "/credits/:id",
  roleMiddleware(["MANAGER"]),
  customerController.deleteCustomerCredit
);

export default router;