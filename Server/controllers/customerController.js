// customerController.js
import prisma from "../config/db.js";
import path from "path";

function getEthiopianTime(date = new Date()) {
  const EAT_OFFSET = 3 * 60 * 60 * 1000; // Ethiopia UTC+3 year-round
  return new Date(date.getTime() + EAT_OFFSET);
}

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(
  __filename.startsWith("/") ? __filename.slice(1) : __filename
);

export const customerController = {
  getAllCustomers: async (req, res) => {
    try {
      const customers = await prisma.customers.findMany({
        include: {
          Sales: {
            select: { id: true, total_amount: true, sealed_date: true },
          },
          CustomerCredit: {
            select: { credit_amount: true, status: true, updated_at: true },
          },
        },
      });
      console.log(
        `Fetched ${customers.length} customers by user ${req.user.id}`
      );
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error.stack);
      res.status(500).json({
        message: "Error fetching customers",
        error: error.message,
      });
    }
  },

  getCustomerById: async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Valid customer ID is required" });
    }

    try {
      const customer = await prisma.customers.findUnique({
        where: { id },
        include: {
          Sales: {
            select: { id: true, total_amount: true, sealed_date: true },
          },
          CustomerCredit: {
            select: { credit_amount: true, status: true, updated_at: true },
          },
        },
      });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      console.log(`Fetched customer ${id} by user ${req.user.id}`);
      res.json(customer);
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error.stack);
      res.status(500).json({
        message: "Error fetching customer",
        error: error.message,
      });
    }
  },

  addCustomer: async (req, res) => {
    const { name, phone, address, status } = req.body;

    if (!name?.trim() || !phone?.trim() || !address?.trim()) {
      return res.status(400).json({
        message: "Name, phone, and address are required and cannot be empty",
      });
    }

    if (!/^\+?\d{9,13}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    if (status && !["ACTIVE", "INACTIVE"].includes(status.toUpperCase())) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    try {
      const customer = await prisma.customers.create({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          status: status?.toUpperCase() || "ACTIVE",
        },
      });
      console.log(`Created customer by user ${req.user.id}:`, customer);
      res.status(201).json({
        message: "Customer created successfully",
        customer,
      });
    } catch (error) {
      console.error("Error adding customer:", error.stack);
      res.status(500).json({
        message: "Error adding customer",
        error: error.message,
      });
    }
  },

  editCustomer: async (req, res) => {
    const { id } = req.params;
    const { name, phone, address, status } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Valid customer ID is required" });
    }

    try {
      const existingCustomer = await prisma.customers.findUnique({
        where: { id },
      });
      if (!existingCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      if (phone && !/^\+?\d{9,13}$/.test(phone)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }

      if (status && !["ACTIVE", "INACTIVE"].includes(status.toUpperCase())) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const customer = await prisma.customers.update({
        where: { id },
        data: {
          name: name?.trim() ?? existingCustomer.name,
          phone: phone?.trim() ?? existingCustomer.phone,
          address: address?.trim() ?? existingCustomer.address,
          status: status?.toUpperCase() ?? existingCustomer.status,
        },
      });
      console.log(`Updated customer ${id} by user ${req.user.id}:`, customer);
      res.status(200).json({
        message: "Customer updated successfully",
        customer,
      });
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error.stack);
      res.status(500).json({
        message: "Error updating customer",
        error: error.message,
      });
    }
  },

  deleteCustomer: async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Valid customer ID is required" });
    }

    try {
      const customer = await prisma.customers.findUnique({ where: { id } });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const [customerSales, customerCredits] = await Promise.all([
        prisma.sales.count({ where: { customer_id: id } }),
        prisma.customerCredit.count({ where: { customer_id: id } }),
      ]);

      if (customerSales > 0 || customerCredits > 0) {
        return res.status(400).json({
          message: "Cannot delete customer with associated sales or credits",
        });
      }

      await prisma.customers.delete({ where: { id } });
      console.log(`Deleted customer ${id} by user ${req.user.id}`);
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error.stack);
      res.status(500).json({
        message: "Error deleting customer",
        error: error.message,
      });
    }
  },

  getAllCustomerCredits: async (req, res) => {
    try {
      const customerCredits = await prisma.customerCredit.findMany({
        include: {
          customer: true,
          user: { select: { username: true } },
        },
      });

      const isManager = req.user.role === "MANAGER";
      const filteredCredits = customerCredits.map((credit) => {
        if (!isManager) {
          const { user, created_by, ...rest } = credit;
          return rest;
        }
        return credit;
      });

      console.log(
        `Fetched ${customerCredits.length} customer credits by user ${req.user.id}`
      );
      res.json(filteredCredits);
    } catch (error) {
      console.error("Error fetching customer credits:", error.stack);
      res.status(500).json({
        message: "Error fetching customer credits",
        error: error.message,
      });
    }
  },

  getCustomerCredits: async (req, res) => {
    const { customer_id } = req.params;

    if (!customer_id || typeof customer_id !== "string") {
      return res.status(400).json({ message: "Valid customer ID is required" });
    }

    try {
      const customerCredits = await prisma.customerCredit.findMany({
        where: { customer_id },
        include: {
          customer: { select: { name: true } },
          user: { select: { username: true } },
        },
        orderBy: { credit_date: "desc" },
      });

      if (!customerCredits || customerCredits.length === 0) {
        return res.status(404).json({
          message: "No credits found for this customer",
        });
      }

      const isManager = req.user.role === "MANAGER";
      const filteredCredits = customerCredits.map((credit) => {
        if (!isManager) {
          const { user, created_by, ...rest } = credit;
          return rest;
        }
        return credit;
      });

      console.log(
        `Fetched ${customerCredits.length} credits for customer ${customer_id} by user ${req.user.id}`
      );
      res.status(200).json({
        creditCount: filteredCredits.length,
        credits: filteredCredits,
      });
    } catch (error) {
      console.error(
        `Error fetching customer credits for ${customer_id}:`,
        error.stack
      );
      res.status(500).json({
        message: "Error fetching customer credits",
        error: error.message,
      });
    }
  },

  addCustomerCredit: async (req, res) => {
    const { customer_id, credit_amount, description, status } = req.body;
    const payment_file = req.file
      ? path.relative(__dirname, req.file.path).replace(/\\/g, "/")
      : null;

    if (!customer_id || !credit_amount) {
      return res.status(400).json({
        message: "Customer ID and credit amount are required",
      });
    }

    try {
      const customer = await prisma.customers.findUnique({
        where: { id: customer_id },
      });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const parsedCreditAmount = parseFloat(credit_amount);
      if (isNaN(parsedCreditAmount) || parsedCreditAmount <= 0) {
        return res.status(400).json({ message: "Invalid credit amount" });
      }

      if (
        status &&
        !["UNPAID", "PARTIALLY_PAID", "PAID"].includes(status.toUpperCase())
      ) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const currentETTime = getEthiopianTime();
      const customerCredit = await prisma.customerCredit.create({
        data: {
          customer_id,
          credit_amount: parsedCreditAmount,
          description: description?.trim() || null,
          status: status?.toUpperCase() || "UNPAID",
          credit_date: currentETTime,
          payment_file,
          updated_at: currentETTime,
          created_by: req.user.id,
        },
        include: {
          customer: true,
          user: { select: { username: true } },
        },
      });

      console.log(
        `Created credit for customer ${customer_id} by user ${req.user.id}:`,
        customerCredit
      );

      const isManager = req.user.role === "MANAGER";
      const responseCredit = isManager
        ? customerCredit
        : { ...customerCredit, created_by: undefined, user: undefined };

      res.status(201).json({
        message: "Customer credit created successfully",
        credit: responseCredit,
      });
    } catch (error) {
      console.error("Error adding customer credit:", error.stack);
      res.status(500).json({
        message: "Error adding customer credit",
        error: error.message,
      });
    }
  },

  editCustomerCredit: async (req, res) => {
    const { id } = req.params;
    const { credit_amount, description, status } = req.body;
    const payment_file = req.file
      ? path.relative(__dirname, req.file.path).replace(/\\/g, "/")
      : undefined;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Valid credit ID is required" });
    }

    try {
      const existingCredit = await prisma.customerCredit.findUnique({
        where: { id },
        include: { user: { select: { username: true } } },
      });
      if (!existingCredit) {
        return res.status(404).json({ message: "Customer credit not found" });
      }

      const parsedCreditAmount =
        credit_amount !== undefined
          ? parseFloat(credit_amount)
          : existingCredit.credit_amount;

      if (
        credit_amount !== undefined &&
        (isNaN(parsedCreditAmount) || parsedCreditAmount <= 0)
      ) {
        return res.status(400).json({ message: "Invalid credit amount" });
      }

      if (
        status &&
        !["UNPAID", "PARTIALLY_PAID", "PAID"].includes(status.toUpperCase())
      ) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const currentETTime = getEthiopianTime();
      const updatedCredit = await prisma.customerCredit.update({
        where: { id },
        data: {
          credit_amount: parsedCreditAmount,
          description: description?.trim() ?? existingCredit.description,
          status: status?.toUpperCase() ?? existingCredit.status,
          payment_file:
            payment_file !== undefined
              ? payment_file
              : existingCredit.payment_file,
          updated_at: currentETTime,
        },
        include: {
          customer: true,
          user: { select: { username: true } },
        },
      });

      console.log(
        `Updated credit ${id} by user ${req.user.id}:`,
        updatedCredit
      );

      const isManager = req.user.role === "MANAGER";
      const responseCredit = isManager
        ? updatedCredit
        : { ...updatedCredit, created_by: undefined, user: undefined };

      res.status(200).json({
        message: "Customer credit updated successfully",
        credit: responseCredit,
      });
    } catch (error) {
      console.error(`Error updating customer credit ${id}:`, error.stack);
      res.status(500).json({
        message: "Error updating customer credit",
        error: error.message,
      });
    }
  },

  deleteCustomerCredit: async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Valid credit ID is required" });
    }

    try {
      const customerCredit = await prisma.customerCredit.findUnique({
        where: { id },
      });
      if (!customerCredit) {
        return res.status(404).json({ message: "Customer credit not found" });
      }

      await prisma.customerCredit.delete({ where: { id } });
      console.log(`Deleted credit ${id} by user ${req.user.id}`);
      res.json({ message: "Customer credit deleted successfully" });
    } catch (error) {
      console.error(`Error deleting customer credit ${id}:`, error.stack);
      res.status(500).json({
        message: "Error deleting customer credit",
        error: error.message,
      });
    }
  },

  generateCreditReport: async (req, res) => {
    const {
      start_date,
      end_date,
      customer_id,
      limit = 100,
      offset = 0,
    } = req.query;

    try {
      const filters = { AND: [] };
      if (customer_id) filters.customer_id = customer_id;
      if (start_date || end_date) {
        filters.credit_date = {};
        if (start_date) filters.credit_date.gte = new Date(start_date);
        if (end_date) filters.credit_date.lte = new Date(end_date);
      }

      const [credits, totalCount] = await Promise.all([
        prisma.customerCredit.findMany({
          where: filters,
          include: {
            customer: { select: { name: true } },
            user: { select: { username: true } },
          },
          orderBy: { credit_date: "desc" },
          take: Math.min(parseInt(limit), 1000),
          skip: parseInt(offset),
        }),
        prisma.customerCredit.count({ where: filters }),
      ]);

      const totalCredits = credits.reduce(
        (sum, credit) => sum + credit.credit_amount,
        0
      );

      const isManager = req.user.role === "MANAGER";
      const filteredCredits = credits.map((credit) => {
        if (!isManager) {
          const { user, created_by, ...rest } = credit;
          return rest;
        }
        return credit;
      });

      console.log(
        `Generated report with ${credits.length} customer credits by user ${req.user.id}`
      );
      res.status(200).json({
        summary: {
          creditCount: credits.length,
          totalCredits,
          totalRecords: totalCount,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
        },
        credits: filteredCredits,
      });
    } catch (error) {
      console.error("Error generating customer credit report:", error.stack);
      res.status(500).json({
        message: "Error generating customer credit report",
        error: error.message,
      });
    }
  },
};
