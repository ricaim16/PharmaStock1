import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

// Helper function for Ethiopian Time (UTC+3)
function getEthiopianTime(date = new Date()) {
  const utcDate = new Date(date);
  const etOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
  return new Date(utcDate.getTime() + etOffset);
}

// Helper to get __dirname in ESM
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(
  __filename.startsWith("/") ? __filename.slice(1) : __filename
);

export const supplierController = {
  getAllSuppliers: async (req, res) => {
    try {
      const suppliers = await prisma.suppliers.findMany({
        include: { SupplierCredits: true },
      });
      console.log(
        `Fetched ${suppliers.length} suppliers by user ${req.user.id}`
      );
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res
        .status(500)
        .json({ message: "Error fetching suppliers", error: error.message });
    }
  },

  getSupplierById: async (req, res) => {
    const { id } = req.params;
    try {
      const supplier = await prisma.suppliers.findUnique({
        where: { id },
        include: { SupplierCredits: true },
      });
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      console.log(`Fetched supplier ${id} by user ${req.user.id}`);
      res.json(supplier);
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      res
        .status(500)
        .json({ message: "Error fetching supplier", error: error.message });
    }
  },

  addSupplier: async (req, res) => {
    const {
      supplier_name,
      contact_info,
      payment_info_cbe,
      payment_info_coop,
      payment_info_boa,
      payment_info_awash,
      payment_info_ebirr,
      location,
      email,
    } = req.body;
    const photo = req.file
      ? path.relative(__dirname, req.file.path).replace(/\\/g, "/")
      : null;

    if (!supplier_name || !contact_info) {
      return res
        .status(400)
        .json({ message: "Supplier name and contact info are required" });
    }

    if (req.file && !["image/jpeg", "image/png"].includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Only JPEG and PNG files are allowed" });
    }

    try {
      const supplier = await prisma.suppliers.create({
        data: {
          supplier_name,
          contact_info,
          payment_info_cbe: payment_info_cbe || null,
          payment_info_coop: payment_info_coop || null,
          payment_info_boa: payment_info_boa || null,
          payment_info_awash: payment_info_awash || null,
          payment_info_ebirr: payment_info_ebirr || null,
          location: location || null,
          email: email || null,
          photo,
        },
      });
      console.log(`Created Supplier by user ${req.user.id}:`, supplier);
      res
        .status(201)
        .json({ message: "Supplier created successfully", supplier });
    } catch (error) {
      console.error("Error adding supplier:", error);
      res
        .status(500)
        .json({ message: "Error adding supplier", error: error.message });
    }
  },

  editSupplier: async (req, res) => {
    const { id } = req.params;
    const {
      supplier_name,
      contact_info,
      payment_info_cbe,
      payment_info_coop,
      payment_info_boa,
      payment_info_awash,
      payment_info_ebirr,
      location,
      email,
    } = req.body;
    const photo = req.file
      ? path.relative(__dirname, req.file.path).replace(/\\/g, "/")
      : undefined;

    if (req.file && !["image/jpeg", "image/png"].includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Only JPEG and PNG files are allowed" });
    }

    try {
      const existingSupplier = await prisma.suppliers.findUnique({
        where: { id },
      });
      if (!existingSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      const supplier = await prisma.suppliers.update({
        where: { id },
        data: {
          supplier_name: supplier_name ?? existingSupplier.supplier_name,
          contact_info: contact_info ?? existingSupplier.contact_info,
          payment_info_cbe:
            payment_info_cbe ?? existingSupplier.payment_info_cbe,
          payment_info_coop:
            payment_info_coop ?? existingSupplier.payment_info_coop,
          payment_info_boa:
            payment_info_boa ?? existingSupplier.payment_info_boa,
          payment_info_awash:
            payment_info_awash ?? existingSupplier.payment_info_awash,
          payment_info_ebirr:
            payment_info_ebirr ?? existingSupplier.payment_info_ebirr,
          location: location ?? existingSupplier.location,
          email: email ?? existingSupplier.email,
          ...(photo !== undefined && { photo }),
        },
      });
      console.log(`Updated Supplier ${id} by user ${req.user.id}:`, supplier);
      res
        .status(200)
        .json({ message: "Supplier updated successfully", supplier });
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      res
        .status(500)
        .json({ message: "Error updating supplier", error: error.message });
    }
  },

  deleteSupplier: async (req, res) => {
    const { id } = req.params;

    try {
      const supplier = await prisma.suppliers.findUnique({
        where: { id },
      });
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      await prisma.suppliers.delete({ where: { id } });
      console.log(`Deleted Supplier ${id} by user ${req.user.id}`);
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      res
        .status(500)
        .json({ message: "Error deleting supplier", error: error.message });
    }
  },

  addSupplierCredit: async (req, res) => {
    const {
      supplier_id,
      credit_amount,
      paid_amount = 0,
      description,
      payment_method = "NONE", // Default to NONE explicitly
    } = req.body;
    const payment_file = req.file
      ? path.relative(__dirname, req.file.path).replace(/\\/g, "/")
      : null;

    if (
      req.file &&
      !["image/jpeg", "image/png", "application/pdf"].includes(
        req.file.mimetype
      )
    ) {
      return res
        .status(400)
        .json({ message: "Only JPEG, PNG, and PDF files are allowed" });
    }

    try {
      const supplier = await prisma.suppliers.findUnique({
        where: { id: supplier_id },
      });
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      const currentETTime = getEthiopianTime();
      const parsedCreditAmount = parseFloat(credit_amount);
      const parsedPaidAmount = parseFloat(paid_amount || 0);

      if (
        isNaN(parsedCreditAmount) ||
        parsedCreditAmount < 0 ||
        parsedPaidAmount < 0
      ) {
        return res
          .status(400)
          .json({ message: "Invalid or negative amounts provided" });
      }

      let payment_status;
      if (parsedPaidAmount === 0) payment_status = "UNPAID";
      else if (parsedPaidAmount < parsedCreditAmount)
        payment_status = "PARTIALLY_PAID";
      else payment_status = "PAID";

      const validPaymentMethods = [
        "NONE",
        "CASH",
        "CBE",
        "COOP",
        "AWASH",
        "EBIRR",
      ];
      const finalPaymentMethod = validPaymentMethods.includes(payment_method)
        ? payment_method
        : "NONE";

      const credit = await prisma.supplierCredits.create({
        data: {
          supplier: { connect: { id: supplier_id } },
          credit_amount: parsedCreditAmount,
          paid_amount: parsedPaidAmount,
          description,
          payment_method: finalPaymentMethod,
          payment_file,
          payment_status,
          credit_date: currentETTime,
          user: { connect: { id: req.user.id } },
          created_at: currentETTime,
          updated_at: currentETTime,
        },
      });

      console.log(
        `Created Credit for supplier ${supplier_id} by user ${req.user.id}:`,
        credit
      );
      res
        .status(201)
        .json({ message: "Supplier credit created successfully", credit });
    } catch (error) {
      console.error("Error adding credit:", error);
      res
        .status(500)
        .json({ message: "Error adding credit", error: error.message });
    }
  },

  editSupplierCredit: async (req, res) => {
    const { id } = req.params;
    const {
      credit_amount,
      paid_amount,
      description,
      payment_method,
      payment_status,
    } = req.body;
    const payment_file = req.file
      ? path.relative(__dirname, req.file.path).replace(/\\/g, "/")
      : undefined;

    if (
      req.file &&
      !["image/jpeg", "image/png", "application/pdf"].includes(
        req.file.mimetype
      )
    ) {
      return res
        .status(400)
        .json({ message: "Only JPEG, PNG, and PDF files are allowed" });
    }

    try {
      const currentETTime = getEthiopianTime();
      const existingCredit = await prisma.supplierCredits.findUnique({
        where: { id },
      });
      if (!existingCredit) {
        return res.status(404).json({ message: "Supplier credit not found" });
      }

      const newCreditAmount =
        credit_amount !== undefined
          ? parseFloat(credit_amount)
          : existingCredit.credit_amount;
      const newPaidAmount =
        paid_amount !== undefined
          ? parseFloat(paid_amount)
          : existingCredit.paid_amount;

      if (isNaN(newCreditAmount) || newCreditAmount < 0 || newPaidAmount < 0) {
        return res
          .status(400)
          .json({ message: "Invalid or negative amounts provided" });
      }

      let updatedPaymentStatus = payment_status;
      if (!updatedPaymentStatus) {
        if (newPaidAmount === 0) updatedPaymentStatus = "UNPAID";
        else if (newPaidAmount < newCreditAmount)
          updatedPaymentStatus = "PARTIALLY_PAID";
        else updatedPaymentStatus = "PAID";
      }

      const validPaymentMethods = [
        "NONE",
        "CASH",
        "CBE",
        "COOP",
        "AWASH",
        "EBIRR",
      ];
      const updatedPaymentMethod = payment_method
        ? validPaymentMethods.includes(payment_method)
          ? payment_method
          : "NONE"
        : existingCredit.payment_method;

      const updatedCredit = await prisma.supplierCredits.update({
        where: { id },
        data: {
          credit_amount: newCreditAmount,
          paid_amount: newPaidAmount,
          description: description ?? existingCredit.description,
          payment_method: updatedPaymentMethod,
          payment_file:
            payment_file !== undefined
              ? payment_file
              : existingCredit.payment_file,
          payment_status: updatedPaymentStatus,
          updated_at: currentETTime,
        },
      });

      console.log(
        `Updated Credit ${id} by user ${req.user.id}:`,
        updatedCredit
      );
      res.status(200).json({
        message: "Supplier credit updated successfully",
        credit: updatedCredit,
      });
    } catch (error) {
      console.error(`Error updating credit ${id}:`, error);
      res
        .status(500)
        .json({ message: "Error updating credit", error: error.message });
    }
  },

  deleteSupplierCredit: async (req, res) => {
    const { id } = req.params;

    try {
      const credit = await prisma.supplierCredits.findUnique({
        where: { id },
      });
      if (!credit) {
        return res.status(404).json({ message: "Supplier credit not found" });
      }

      await prisma.supplierCredits.delete({ where: { id } });
      console.log(`Deleted Credit ${id} by user ${req.user.id}`);
      res.json({ message: "Supplier credit deleted successfully" });
    } catch (error) {
      console.error(`Error deleting credit ${id}:`, error);
      res
        .status(500)
        .json({ message: "Error deleting credit", error: error.message });
    }
  },

  getSupplierCredits: async (req, res) => {
    const { supplier_id } = req.params;

    try {
      const credits = await prisma.supplierCredits.findMany({
        where: { supplier_id },
        include: { supplier: { select: { supplier_name: true } } },
        orderBy: { credit_date: "desc" },
      });

      console.log(
        `Fetched ${credits.length} credits for supplier ${supplier_id} by user ${req.user.id}`
      );
      res.status(200).json({ creditCount: credits.length, credits });
    } catch (error) {
      console.error(
        `Error fetching supplier credits for ${supplier_id}:`,
        error
      );
      res.status(500).json({
        message: "Error fetching supplier credits",
        error: error.message,
      });
    }
  },

  generateCreditReport: async (req, res) => {
    const {
      start_date,
      end_date,
      supplier_id,
      limit = 100,
      offset = 0,
    } = req.query;

    try {
      const filters = {};
      if (supplier_id) filters.supplier_id = supplier_id;
      if (start_date || end_date) {
        filters.credit_date = {};
        if (start_date) filters.credit_date.gte = new Date(start_date);
        if (end_date) filters.credit_date.lte = new Date(end_date);
      }

      const credits = await prisma.supplierCredits.findMany({
        where: filters,
        include: { supplier: { select: { supplier_name: true } } },
        orderBy: { credit_date: "desc" },
        take: parseInt(limit),
        skip: parseInt(offset),
      });

      const totalCredits = credits.reduce(
        (sum, credit) => sum + credit.credit_amount,
        0
      );
      const totalPaid = credits.reduce(
        (sum, credit) => sum + credit.paid_amount,
        0
      );
      const totalPending = totalCredits - totalPaid;

      console.log(
        `Generated report with ${credits.length} credits by user ${req.user.id}`
      );
      res.status(200).json({
        summary: {
          creditCount: credits.length,
          totalCredits,
          totalPaid,
          totalPending,
        },
        credits,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res
        .status(500)
        .json({ message: "Error generating report", error: error.message });
    }
  },
};
