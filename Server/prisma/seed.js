import prisma from "../config/db.js";
import { hashPassword } from "../utils/hashPassword.js";
import log from "../utils/logger.js"; // Import your logger

export const seedDatabase = async () => {
  try {
    // Check if any manager exists in the database
    const existingManager = await prisma.users.findFirst({
      where: { role: "MANAGER" },
    });

    if (existingManager) {
      log("warn", "Manager account already exists, skipping database seeding.");
      return; // Exit early if a manager already exists
    }

    const managerData = {
      FirstName: "Sample",
      LastName: "Manager",
      username: "Admin",
      password: "123",
      role: "MANAGER",
    };

    const hashedPassword = await hashPassword(managerData.password);
    const manager = await prisma.users.create({
      data: {
        FirstName: managerData.FirstName,
        LastName: managerData.LastName,
        username: managerData.username,
        password: hashedPassword,
        role: managerData.role,
        status: "ACTIVE",
      },
    });

    log("info", `Sample manager account created: ${managerData.username}`);
  } catch (error) {
    log("error", "Failed to seed database: " + error.message);
    throw error;
  }
};
