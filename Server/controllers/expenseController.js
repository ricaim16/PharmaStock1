import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs/promises"; // For file deletion

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, and .png files are allowed!"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("receipt");

export const expenseController = {
  getAllExpenses: async (req, res) => {
    try {
      const expenses = await prisma.expenses.findMany({
        orderBy: { date: "desc" },
      });
      console.log(
        `Fetched ${expenses.length} expenses by user ${
          req.user?.id || "unknown"
        }`
      );
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error.stack);
      res
        .status(500)
        .json({ message: "Error fetching expenses", error: error.message });
    }
  },

  getExpenseReport: async (req, res) => {
    try {
      const expenses = await prisma.expenses.findMany();
      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const expensesByReason = expenses.reduce((acc, expense) => {
        const { reason, amount } = expense;
        if (!acc[reason]) {
          acc[reason] = { total: 0, count: 0 };
        }
        acc[reason].total += amount;
        acc[reason].count += 1;
        return acc;
      }, {});
      const report = {
        totalExpenses,
        expensesByCategory: Object.entries(expensesByReason).map(
          ([reason, data]) => ({
            category: reason,
            total: data.total,
            count: data.count,
          })
        ),
      };
      console.log(
        `Generated expense report by user ${req.user?.id || "unknown"}:`,
        report
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating expense report:", error.stack);
      res
        .status(500)
        .json({
          message: "Error generating expense report",
          error: error.message,
        });
    }
  },

  addExpense: (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const {
        reason,
        amount,
        description,
        date,
        payment_method,
        additional_info,
      } = req.body;
      if (!reason || !amount || !date) {
        return res
          .status(400)
          .json({ message: "Reason, amount, and date are required" });
      }
      try {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return res.status(400).json({ message: "Invalid amount" });
        }
        const expenseDate = new Date(date);
        if (isNaN(expenseDate.getTime())) {
          return res.status(400).json({ message: "Invalid date" });
        }
        const receipt = req.file ? `/uploads/${req.file.filename}` : null;
        const expense = await prisma.expenses.create({
          data: {
            reason,
            amount: parsedAmount,
            description: description || null,
            date: expenseDate,
            payment_method: payment_method || null,
            receipt,
            additional_info: additional_info || null,
          },
        });
        console.log(`Created expense:`, expense);
        res
          .status(201)
          .json({ message: "Expense recorded successfully", expense });
      } catch (error) {
        console.error("Error adding expense:", error.stack);
        res
          .status(500)
          .json({ message: "Error adding expense", error: error.message });
      }
    });
  },

  updateExpense: (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const { id } = req.params;
      const {
        reason,
        amount,
        description,
        date,
        payment_method,
        additional_info,
      } = req.body;

      try {
        const existingExpense = await prisma.expenses.findUnique({
          where: { id: id }, // Use ID directly as a string
        });
        if (!existingExpense) {
          return res.status(404).json({ message: "Expense not found" });
        }

        const parsedAmount = amount
          ? parseFloat(amount)
          : existingExpense.amount;
        if (amount && (isNaN(parsedAmount) || parsedAmount <= 0)) {
          return res.status(400).json({ message: "Invalid amount" });
        }
        const expenseDate = date ? new Date(date) : existingExpense.date;
        if (date && isNaN(expenseDate.getTime())) {
          return res.status(400).json({ message: "Invalid date" });
        }

        const receipt = req.file
          ? `/uploads/${req.file.filename}`
          : existingExpense.receipt;

        const updatedExpense = await prisma.expenses.update({
          where: { id: id }, // Use ID directly as a string
          data: {
            reason: reason || existingExpense.reason,
            amount: parsedAmount,
            description: description || existingExpense.description,
            date: expenseDate,
            payment_method: payment_method || existingExpense.payment_method,
            receipt,
            additional_info: additional_info || existingExpense.additional_info,
          },
        });

        // Delete old receipt if a new one was uploaded
        if (
          req.file &&
          existingExpense.receipt &&
          existingExpense.receipt !== receipt
        ) {
          await fs
            .unlink(path.join(process.cwd(), existingExpense.receipt))
            .catch((err) =>
              console.error("Failed to delete old receipt:", err)
            );
        }

        console.log(`Updated expense:`, updatedExpense);
        res.json({
          message: "Expense updated successfully",
          expense: updatedExpense,
        });
      } catch (error) {
        console.error("Error updating expense:", error.stack);
        res
          .status(500)
          .json({ message: "Error updating expense", error: error.message });
      }
    });
  },

  deleteExpense: async (req, res) => {
    const { id } = req.params;
    try {
      const existingExpense = await prisma.expenses.findUnique({
        where: { id: id }, // Use ID directly as a string
      });
      if (!existingExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      // Delete the receipt file if it exists
      if (existingExpense.receipt) {
        await fs
          .unlink(path.join(process.cwd(), existingExpense.receipt))
          .catch((err) => console.error("Failed to delete receipt:", err));
      }

      await prisma.expenses.delete({ where: { id: id } }); // Use ID directly as a string
      console.log(
        `Deleted expense with ID ${id} by user ${req.user?.id || "unknown"}`
      );
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error.stack);
      res
        .status(500)
        .json({ message: "Error deleting expense", error: error.message });
    }
  },
};
