import prisma from "../config/db.js";
import { hashPassword } from "../utils/hashPassword.js";
import log from "../utils/logger.js"; // Import your logger

export const seedDatabase = async () => {
  try {
    const managerData = {
      FirstName: "Sample",
      LastName: "Manager",
      username: "manager1",
      password: "Manager@123",
      role: "MANAGER",
    };

    const existingManager = await prisma.users.findUnique({
      where: { username: managerData.username },
    });

    if (!existingManager) {
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

      // Removed the prisma.members.create block to prevent creating a member profile for the manager
      log("info", `Sample manager account created: ${managerData.username}`);
    } else {
      log("warn", "Manager account already exists, skipping manager seeding.");
    }
  } catch (error) {
    log("error", "Failed to seed database: " + error.message);
    throw error;
  }
};
