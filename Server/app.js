// app.js
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import memberRoutes from "./routes/memberRoutes.js"; // Add this line
import { errorHandler } from "./middlewares/auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for testing
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// User routes
app.use("/api/users", userRoutes);
// Members routes
app.use("/api/members", memberRoutes); // Add this line

// Error handling middleware
app.use(errorHandler);

export default app;
