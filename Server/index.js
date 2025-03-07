import "dotenv/config";
import { dbConnect } from "./config/db.js";
import { seedDatabase } from "./prisma/seed.js";
import app from "./app.js";
import log from "./utils/logger.js"; // Import your logger

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();
    log("info", "Database connected successfully");

    await seedDatabase();
    log("info", "Database seeding completed");

    app.listen(PORT, () => {
      log("info", `Server is running on port ${PORT}`);
    });
  } catch (err) {
    log("error", "Application startup failed: " + err.message);
    process.exit(1);
  }
};

startServer();
