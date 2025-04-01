import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dosageFormRoutes from "./routes/dosageFormRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import returnsRoutes from "./routes/returnsRoutes.js";
import expenseRoutes from "./routes/expenseRouter.js"; // Add this import
import { errorHandler } from "./middlewares/auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

console.log("Mounting routes...");
app.use("/api/users", userRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dosage-forms", dosageFormRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/returns", returnsRoutes);
app.use("/api/expenses", expenseRoutes); // Add this line to mount expense routes
console.log("All routes mounted");

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Fallback route
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: { message: "Route not found" } });
});

app.use(errorHandler);

export default app;
