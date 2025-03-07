import prisma from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";

// Create User (Manager only, no additional managers)
export const createUser = async (req, res, next) => {
  try {
    const { FirstName, LastName, username, password, role, status } = req.body;

    if (!FirstName || !LastName || !username || !password || !role || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (req.user.role !== "MANAGER") {
      return res.status(403).json({ error: "Only managers can create users" });
    }

    if (role.toUpperCase() === "MANAGER") {
      const existingManager = await prisma.users.findFirst({
        where: { role: "MANAGER" },
      });
      if (existingManager) {
        return res.status(403).json({ error: "Only one manager is allowed" });
      }
    }

    const existingUser = await prisma.users.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        FirstName,
        LastName,
        username,
        password: hashedPassword,
        role: role.toUpperCase(),
        status: status.toUpperCase(),
      },
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

    // Employee restrictions: only FirstName, LastName, username, password
    if (req.user.role === "EMPLOYEE") {
      if (FirstName) updateData.FirstName = FirstName;
      if (LastName) updateData.LastName = LastName;
      if (username) updateData.username = username;
      if (hashedPassword) updateData.password = hashedPassword;
      // Ignore role and status for employees
    } else if (req.user.role === "MANAGER") {
      // Manager can update all fields
      updateData.FirstName = FirstName ?? user.FirstName;
      updateData.LastName = LastName ?? user.LastName;
      updateData.username = username ?? user.username;
      updateData.password = hashedPassword ?? user.password;
      updateData.role = role ? role.toUpperCase() : user.role;
      updateData.status = status ? status.toUpperCase() : user.status;
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
