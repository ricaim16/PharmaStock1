import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function for Ethiopian Time (UTC+3)
function getEthiopianTime(date = new Date()) {
  const utcDate = new Date(date);
  const etOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
  return new Date(utcDate.getTime() + etOffset);
}

export const supplierController = {
  // List all suppliers (Manager/Employee)
  getAllSuppliers: async (req, res) => {
    try {
      const suppliers = await prisma.suppliers.findMany({
        include: { SupplierCredits: true }, // Include related credits
      });
      console.log(`Fetched ${suppliers.length} suppliers`);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res
        .status(500)
        .json({ message: "Error fetching suppliers", error: error.message });
    }
  },

  // Add a new supplier (Manager only)
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
    const photo = req.file ? req.file.path : null; // Capture uploaded photo
    console.log("Request Body:", req.body, "Photo:", photo);

    try {
      const supplier = await prisma.suppliers.create({
        data: {
          supplier_name,
          contact_info,
          payment_info_cbe,
          payment_info_coop,
          payment_info_boa,
          payment_info_awash,
          payment_info_ebirr,
          location,
          email,
          photo, // Save photo path
        },
      });
      console.log("Created Supplier:", supplier);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error adding supplier:", error);
      res
        .status(500)
        .json({ message: "Error adding supplier", error: error.message });
    }
  },

  // Edit a supplier (Manager only)
  editSupplier: async (req, res) => {
    const { id } = req.params; // id is a string (UUID)
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
    const photo = req.file ? req.file.path : undefined; // Only update if new file
    console.log("Request Body:", req.body, "Photo:", photo, "ID:", id);

    try {
      // Validate that the supplier exists
      const existingSupplier = await prisma.suppliers.findUnique({
        where: { id }, // Use string id directly
      });
      if (!existingSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      const supplier = await prisma.suppliers.update({
        where: { id }, // Use string id directly (UUID)
        data: {
          supplier_name,
          contact_info,
          payment_info_cbe,
          payment_info_coop,
          payment_info_boa,
          payment_info_awash,
          payment_info_ebirr,
          location,
          email,
          ...(photo !== undefined && { photo }), // Conditionally update photo
        },
      });
      console.log("Updated Supplier:", supplier);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res
        .status(500)
        .json({ message: "Error updating supplier", error: error.message });
    }
  },

  // Delete a supplier (Manager only)
  deleteSupplier: async (req, res) => {
    const { id } = req.params;

    try {
      const supplier = await prisma.suppliers.findUnique({
        where: { id }, // Use string id directly
      });
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      await prisma.suppliers.delete({ where: { id } });
      console.log("Deleted Supplier ID:", id);
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res
        .status(500)
        .json({ message: "Error deleting supplier", error: error.message });
    }
  },

  // Add a supplier credit (Manager/Employee)
  addSupplierCredit: async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded File Path:", req.file?.path);

    const {
      supplier_id,
      credit_amount,
      paid_amount = 0,
      description,
      transaction_type,
    } = req.body;

    try {
      const currentETTime = getEthiopianTime();
      console.log("Current Ethiopian Time:", currentETTime);

      let payment_status;
      if (paid_amount === 0) payment_status = "PENDING";
      else if (paid_amount < credit_amount) payment_status = "PARTIALLY_PAID";
      else payment_status = "PAID";

      console.log("Payment Status:", payment_status);

      const credit = await prisma.supplierCredits.create({
        data: {
          supplier: {
            connect: { id: supplier_id },
          },
          credit_amount: parseFloat(credit_amount),
          paid_amount: parseFloat(paid_amount || 0),
          description,
          transaction_type,
          payment_file: req.file ? req.file.path : null,
          payment_status,
          credit_date: currentETTime,
          user: {
            connect: { id: req.user.id },
          },
          created_at: currentETTime,
          updated_at: currentETTime,
        },
      });

      console.log("Created Credit:", credit);
      res.status(201).json(credit);
    } catch (error) {
      console.error("Full Error Details:", error);
      res
        .status(500)
        .json({ message: "Error adding credit", error: error.message });
    }
  },

  // Edit a supplier credit (Manager/Employee)
  editSupplierCredit: async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded File Path:", req.file?.path);
    const { id } = req.params;
    const {
      credit_amount,
      paid_amount,
      description,
      transaction_type,
      payment_status,
    } = req.body;

    try {
      const currentETTime = getEthiopianTime();
      console.log("Current Ethiopian Time:", currentETTime);

      const existingCredit = await prisma.supplierCredits.findUnique({
        where: { id },
      });
      if (!existingCredit) {
        return res.status(404).json({ message: "Supplier credit not found" });
      }

      let updatedPaymentStatus = payment_status;
      if (!updatedPaymentStatus) {
        const newPaidAmount = parseFloat(
          paid_amount ?? existingCredit.paid_amount
        );
        const newCreditAmount = parseFloat(
          credit_amount ?? existingCredit.credit_amount
        );
        if (newPaidAmount === 0) updatedPaymentStatus = "PENDING";
        else if (newPaidAmount < newCreditAmount)
          updatedPaymentStatus = "PARTIALLY_PAID";
        else updatedPaymentStatus = "PAID";
      }

      const updatedCredit = await prisma.supplierCredits.update({
        where: { id },
        data: {
          credit_amount: credit_amount
            ? parseFloat(credit_amount)
            : existingCredit.credit_amount,
          paid_amount: paid_amount
            ? parseFloat(paid_amount)
            : existingCredit.paid_amount,
          description: description ?? existingCredit.description,
          transaction_type: transaction_type ?? existingCredit.transaction_type,
          payment_file: req.file ? req.file.path : existingCredit.payment_file,
          payment_status: updatedPaymentStatus,
          updated_at: currentETTime,
        },
      });

      console.log("Updated Credit:", updatedCredit);
      res.status(200).json(updatedCredit);
    } catch (error) {
      console.error("Error updating credit:", error);
      res
        .status(500)
        .json({ message: "Error updating credit", error: error.message });
    }
  },

  // Delete a supplier credit (Manager only)
  deleteSupplierCredit: async (req, res) => {
    const { id } = req.params;

    try {
      const credit = await prisma.supplierCredits.findUnique({
        where: { id },
      });
      if (!credit) {
        return res.status(404).json({ message: "Supplier credit not found" });
      }

      await prisma.supplierCredits.delete({
        where: { id },
      });

      console.log("Deleted Credit ID:", id);
      res.status(200).json({ message: "Supplier credit deleted successfully" });
    } catch (error) {
      console.error("Error deleting credit:", error);
      res
        .status(500)
        .json({ message: "Error deleting credit", error: error.message });
    }
  },

  // List credits for a specific supplier (Manager/Employee)
  getSupplierCredits: async (req, res) => {
    const { supplier_id } = req.params;

    try {
      const credits = await prisma.supplierCredits.findMany({
        where: { supplier_id },
        include: {
          supplier: {
            select: { supplier_name: true },
          },
        },
        orderBy: { credit_date: "desc" },
      });

      console.log(
        `Fetched ${credits.length} credits for supplier ${supplier_id}`
      );
      res.status(200).json({
        creditCount: credits.length,
        credits,
      });
    } catch (error) {
      console.error("Error fetching supplier credits:", error);
      res.status(500).json({
        message: "Error fetching supplier credits",
        error: error.message,
      });
    }
  },

  // Generate Report (Manager/Employee)
  generateCreditReport: async (req, res) => {
    const { start_date, end_date, supplier_id } = req.query;

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
        include: {
          supplier: { select: { supplier_name: true } },
        },
        orderBy: { credit_date: "desc" },
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

      console.log(`Generated report with ${credits.length} credits`);
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
