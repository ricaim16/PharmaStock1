import { PrismaClient } from "@prisma/client";
import log from "../utils/logger.js";

const prisma = new PrismaClient();

export const createObjective = async (req, res) => {
  try {
    const { title, description, time_period, progress } = req.body;
    if (!title || !description || !time_period || progress === undefined) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: title, description, time_period, and progress are required",
      });
    }
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: "Progress must be a number between 0 and 100",
      });
    }

    const objective = await prisma.objectives.create({
      data: {
        title,
        description,
        time_period,
        progress: parseFloat(progress),
      },
    });

    log(
      "info",
      `Objective created by manager: ${req.user.id}, Objective ID: ${objective.id}`
    );
    res.status(201).json({ success: true, data: objective });
  } catch (error) {
    log("error", `Error creating objective: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getObjectives = async (req, res) => {
  try {
    const objectives = await prisma.objectives.findMany({
      include: { KeyResults: true },
    });
    res.status(200).json({ success: true, data: objectives });
  } catch (error) {
    log("error", `Error fetching objectives: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getObjective = async (req, res) => {
  try {
    const { id } = req.params;
    const objective = await prisma.objectives.findUnique({
      where: { id },
      include: { KeyResults: true },
    });

    if (!objective) {
      return res
        .status(404)
        .json({ success: false, error: "Objective not found" });
    }

    res.status(200).json({ success: true, data: objective });
  } catch (error) {
    log("error", `Error fetching objective: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateObjective = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, time_period, progress } = req.body;

    if (
      progress !== undefined &&
      (typeof progress !== "number" || progress < 0 || progress > 100)
    ) {
      return res.status(400).json({
        success: false,
        error: "Progress must be a number between 0 and 100",
      });
    }

    const objective = await prisma.objectives.update({
      where: { id },
      data: {
        title,
        description,
        time_period,
        progress: progress !== undefined ? parseFloat(progress) : undefined,
      },
    });

    log(
      "info",
      `Objective updated by manager: ${req.user.id}, Objective ID: ${objective.id}`
    );
    res.status(200).json({ success: true, data: objective });
  } catch (error) {
    log("error", `Error updating objective: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteObjective = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.objectives.delete({ where: { id } });

    log(
      "info",
      `Objective deleted by manager: ${req.user.id}, Objective ID: ${id}`
    );
    res.status(204).json({ success: true });
  } catch (error) {
    log("error", `Error deleting objective: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const createKeyResult = async (req, res) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }
  try {
    const { objective_id, title, description, weight, deadline, progress } =
      req.body;

    if (
      !objective_id ||
      !title ||
      !description ||
      !weight ||
      !deadline ||
      progress === undefined
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: objective_id, title, description, weight, deadline, and progress are required",
      });
    }
    if (typeof weight !== "number" || weight <= 0 || weight > 1) {
      return res.status(400).json({
        success: false,
        error: "Weight must be a number between 0 and 1",
      });
    }
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: "Progress must be a number between 0 and 100",
      });
    }

    const objective = await prisma.objectives.findUnique({
      where: { id: objective_id },
    });
    if (!objective) {
      return res
        .status(404)
        .json({ success: false, error: "Objective not found" });
    }

    const keyResult = await prisma.keyResults.create({
      data: {
        objective_id,
        title,
        description,
        weight: parseFloat(weight),
        deadline: new Date(deadline),
        progress: parseFloat(progress),
      },
    });

    log(
      "info",
      `Key Result created by manager: ${req.user.id}, Key Result ID: ${keyResult.id}`
    );
    res.status(201).json({ success: true, data: keyResult });
  } catch (error) {
    log("error", `Error creating key result: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateKeyResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, weight, deadline, progress } = req.body;

    if (
      weight !== undefined &&
      (typeof weight !== "number" || weight <= 0 || weight > 1)
    ) {
      return res.status(400).json({
        success: false,
        error: "Weight must be a number between 0 and 1",
      });
    }
    if (
      progress !== undefined &&
      (typeof progress !== "number" || progress < 0 || progress > 100)
    ) {
      return res.status(400).json({
        success: false,
        error: "Progress must be a number between 0 and 100",
      });
    }

    const keyResult = await prisma.keyResults.update({
      where: { id },
      data: {
        title,
        description,
        weight: weight !== undefined ? parseFloat(weight) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        progress: progress !== undefined ? parseFloat(progress) : undefined,
      },
    });

    log(
      "info",
      `Key Result updated by manager: ${req.user.id}, Key Result ID: ${keyResult.id}`
    );
    res.status(200).json({ success: true, data: keyResult });
  } catch (error) {
    log("error", `Error updating key result: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteKeyResult = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.keyResults.delete({ where: { id } });

    log(
      "info",
      `Key Result deleted by manager: ${req.user.id}, Key Result ID: ${id}`
    );
    res.status(204).json({ success: true });
  } catch (error) {
    log("error", `Error deleting key result: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const generateOKRReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};
    if (startDate && endDate) {
      filters.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const objectives = await prisma.objectives.findMany({
      where: filters,
      include: { KeyResults: true },
    });

    const report = objectives.map((objective) => ({
      objective: {
        id: objective.id,
        title: objective.title,
        description: objective.description,
        time_period: objective.time_period,
        progress: objective.progress,
      },
      keyResults: objective.KeyResults.map((kr) => ({
        id: kr.id,
        title: kr.title,
        description: kr.description,
        weight: kr.weight,
        deadline: kr.deadline,
        progress: kr.progress,
      })),
      overallProgress:
        objective.KeyResults.length > 0
          ? objective.KeyResults.reduce(
              (sum, kr) => sum + kr.progress * kr.weight,
              0
            )
          : objective.progress,
    }));

    log("info", `OKR report generated by manager: ${req.user.id}`);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    log("error", `Error generating OKR report: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getKeyResults = async (req, res) => {
  try {
    console.log("Inside getKeyResults function"); // Added for debugging
    const keyResults = await prisma.keyResults.findMany();
    res.status(200).json({ success: true, data: keyResults });
  } catch (error) {
    log("error", `Error fetching key results: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};
