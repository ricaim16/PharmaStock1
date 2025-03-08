import prisma from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";
import log from "../utils/logger.js"; // Import your logger

// Create User (Manager only, no additional managers)
export const createUser = async (req, res, next) => {
  try {
    const { FirstName, LastName, username, password, role, status } = req.body;

    // Validate required fields
    if (!FirstName || !LastName || !username || !password || !role || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the requester is a manager
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({ error: "Only managers can create users" });
    }

    // Normalize role and status
    const normalizedRole = role.toUpperCase();
    const normalizedStatus = status.toUpperCase();

    // Check for duplicate username
    const existingUser = await prisma.users.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Use a transaction to ensure atomicity
    const user = await prisma.$transaction(async (prisma) => {
      // Enforce single manager rule
      if (normalizedRole === "MANAGER") {
        const managerCount = await prisma.users.count({
          where: { role: "MANAGER" },
        });
        if (managerCount > 0) {
          throw new Error("Only one manager is allowed");
        }
      }

      // Create the user
      return prisma.users.create({
        data: {
          FirstName,
          LastName,
          username,
          password: hashedPassword,
          role: normalizedRole,
          status: normalizedStatus,
        },
      });
    });

    console.log("Created User:", user);
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    if (error.message === "Only one manager is allowed") {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

// Get All Users (Manager only - employees only)
export const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res
        .status(403)
        .json({ error: "Only managers can view all users" });
    }

    const users = await prisma.users.findMany({
      where: { role: "EMPLOYEE" },
      include: { member: true },
    });

    console.log("Fetched Users:", users);
    res.status(200).json({
      userCount: users.length,
      users: users.map((user) => ({
        id: user.id,
        FirstName: user.FirstName,
        LastName: user.LastName,
        username: user.username,
        role: user.role,
        status: user.status,
        member: user.member,
      })),
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    next(error);
  }
};

// Get User by ID (Manager sees any, employees see self)
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id },
      include: { member: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.user.role === "EMPLOYEE" && id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only view your own profile" });
    }

    console.log("Fetched User by ID:", user);
    res.status(200).json({
      id: user.id,
      FirstName: user.FirstName,
      LastName: user.LastName,
      username: user.username,
      Password: user.password, // Include hashed password
      role: user.role,
      status: user.status,
      member: user.member,
    });
  } catch (error) {
    console.error(`Error in getUserById for ID ${req.params.id}:`, error);
    next(error);
  }
};

// Update User (Manager updates any, employees update self with restrictions)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { FirstName, LastName, username, password, role, status } = req.body;

    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Authorization
    if (req.user.role === "EMPLOYEE" && id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own account" });
    }

    // Prevent manager from updating their own role or status
    if (req.user.role === "MANAGER" && id === req.user.id) {
      if (role !== undefined || status !== undefined) {
        return res
          .status(403)
          .json({ error: "Manager cannot update their own role or status" });
      }
    }

    // Enforce single manager rule for role updates (for other users)
    if (
      req.user.role === "MANAGER" &&
      role &&
      role.toUpperCase() === "MANAGER" &&
      id !== req.user.id
    ) {
      const existingManager = await prisma.users.findFirst({
        where: { role: "MANAGER" },
      });
      if (existingManager && existingManager.id !== id) {
        return res.status(403).json({ error: "Only one manager is allowed" });
      }
    }

    // Check for username uniqueness if provided
    if (username && username !== user.username) {
      const existingUser = await prisma.users.findUnique({
        where: { username },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Prepare update data
    const updateData = {};

    if (req.user.role === "EMPLOYEE") {
      // Employee restrictions: only FirstName, LastName, username, password
      if (FirstName) updateData.FirstName = FirstName;
      if (LastName) updateData.LastName = LastName;
      if (username) updateData.username = username;
      if (hashedPassword) updateData.password = hashedPassword;
    } else if (req.user.role === "MANAGER") {
      if (id === req.user.id) {
        // Manager updating self: only allow FirstName, LastName, username, password
        if (FirstName) updateData.FirstName = FirstName;
        if (LastName) updateData.LastName = LastName;
        if (username) updateData.username = username;
        if (hashedPassword) updateData.password = hashedPassword;
      } else {
        // Manager updating others: can update all fields
        updateData.FirstName = FirstName ?? user.FirstName;
        updateData.LastName = LastName ?? user.LastName;
        updateData.username = username ?? user.username;
        if (hashedPassword) updateData.password = hashedPassword;
        updateData.role = role ? role.toUpperCase() : user.role;
        updateData.status = status ? status.toUpperCase() : user.status;
      }
    }

    // Update the user
    const updatedUser = await prisma.users.update({
      where: { id },
      data: updateData,
    });

    // Sync FirstName and LastName to Members if changed
    const member = await prisma.members.findUnique({ where: { user_id: id } });
    if (member && (FirstName || LastName)) {
      await prisma.members.update({
        where: { id: member.id },
        data: {
          FirstName: updatedUser.FirstName,
          LastName: updatedUser.LastName,
        },
      });
    }

    console.log("Updated User:", updatedUser);
    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        FirstName: updatedUser.FirstName,
        LastName: updatedUser.LastName,
        username: updatedUser.username,
        Password: updatedUser.password, // Include hashed password
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error(`Error in updateUser for ID ${req.params.id}:`, error);
    next(error);
  }
};

// Delete User (Manager only, prevent self-deletion)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.user.role !== "MANAGER") {
      return res.status(403).json({ error: "Only managers can delete users" });
    }

    if (id === req.user.id) {
      return res
        .status(403)
        .json({ error: "Manager cannot delete themselves" });
    }

    await prisma.users.delete({ where: { id } });
    console.log("Deleted User with ID:", id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteUser for ID ${req.params.id}:`, error);
    next(error);
  }
};

// Login (Both manager and employee) - Updated to check role
export const login = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ error: "Username, password, and role are required" });
    }

    // Normalize role to uppercase to match database convention
    const requestedRole = role.toUpperCase();

    const user = await prisma.users.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if the requested role matches the user's role in the database
    if (user.role !== requestedRole) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ error: "Account is inactive" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful for user:", user.username);
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    next(error);
  }
};
