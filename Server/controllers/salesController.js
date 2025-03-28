import prisma from "../config/db.js";

function getEthiopianTime(date = new Date()) {
  const utcDate = new Date(date);
  const etOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
  return new Date(utcDate.getTime() + etOffset);
}

export const salesController = {
  getAllSales: async (req, res) => {
    try {
      const sales = await prisma.sales.findMany({
        include: {
          medicine: { select: { medicine_name: true } },
          customer: { select: { name: true } },
          dosage_form: { select: { name: true } },
          createdBy: { select: { username: true } },
        },
        orderBy: { sealed_date: "desc" },
      });
      console.log(
        `Fetched ${sales.length} sales by user ${req.user?.id || "unknown"}`
      );
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error.stack);
      res
        .status(500)
        .json({ message: "Error fetching sales", error: error.message });
    }
  },

  getSaleById: async (req, res) => {
    const { id } = req.params;
    try {
      const sale = await prisma.sales.findUnique({
        where: { id },
        include: {
          medicine: { select: { medicine_name: true } },
          customer: { select: { name: true } },
          dosage_form: { select: { name: true } },
          createdBy: { select: { username: true } },
        },
      });
      if (!sale) return res.status(404).json({ message: "Sale not found" });
      console.log(`Fetched sale ${id} by user ${req.user?.id || "unknown"}`);
      res.json(sale);
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error.stack);
      res
        .status(500)
        .json({ message: "Error fetching sale", error: error.message });
    }
  },

  addSale: async (req, res) => {
    const {
      medicine_id,
      customer_id,
      dosage_form_id,
      quantity,
      price,
      payment_method,
      prescription,
      product_name,
      product_batch_number,
    } = req.body;

    if (
      !medicine_id ||
      !customer_id ||
      !dosage_form_id ||
      !quantity ||
      !price
    ) {
      return res.status(400).json({
        message:
          "Medicine ID, customer ID, dosage form ID, quantity, and price are required",
      });
    }

    try {
      const [medicine, customer, dosageForm] = await Promise.all([
        prisma.medicines.findUnique({ where: { id: medicine_id } }),
        prisma.customers.findUnique({ where: { id: customer_id } }),
        prisma.dosageForms.findUnique({ where: { id: dosage_form_id } }),
      ]);

      if (!medicine)
        return res.status(404).json({ message: "Medicine not found" });
      if (!customer)
        return res.status(404).json({ message: "Customer not found" });
      if (!dosageForm)
        return res.status(404).json({ message: "Dosage form not found" });

      const parsedQuantity = parseInt(quantity);
      const parsedPrice = parseFloat(price);
      if (
        isNaN(parsedQuantity) ||
        parsedQuantity <= 0 ||
        isNaN(parsedPrice) ||
        parsedPrice <= 0
      ) {
        return res.status(400).json({ message: "Invalid quantity or price" });
      }

      const total_amount = parsedQuantity * parsedPrice;
      const currentETTime = getEthiopianTime();

      const sale = await prisma.sales.create({
        data: {
          product_name: product_name || null,
          product_batch_number: product_batch_number || null,
          quantity: parsedQuantity,
          price: parsedPrice,
          total_amount,
          payment_method: payment_method || "NONE",
          prescription: prescription === true,
          dosage_form_id,
          customer_id,
          sealed_date: currentETTime,
          medicine_id,
          created_by: req.user.id,
          created_at: currentETTime,
          updated_at: currentETTime,
        },
        include: {
          medicine: { select: { medicine_name: true } },
          customer: { select: { name: true } },
          dosage_form: { select: { name: true } },
          createdBy: { select: { username: true } },
        },
      });

      console.log(`Created sale by user ${req.user?.id || "unknown"}:`, sale);
      res.status(201).json({ message: "Sale created successfully", sale });
    } catch (error) {
      console.error("Error adding sale:", error.stack);
      res
        .status(500)
        .json({ message: "Error adding sale", error: error.message });
    }
  },

  editSale: async (req, res) => {
    const { id } = req.params;
    const {
      medicine_id,
      customer_id,
      dosage_form_id,
      quantity,
      price,
      payment_method,
      prescription,
      product_name,
      product_batch_number,
    } = req.body;

    try {
      const existingSale = await prisma.sales.findUnique({ where: { id } });
      if (!existingSale)
        return res.status(404).json({ message: "Sale not found" });

      const medicine = medicine_id
        ? await prisma.medicines.findUnique({ where: { id: medicine_id } })
        : null;
      if (medicine_id && !medicine)
        return res.status(404).json({ message: "Medicine not found" });

      const customer = customer_id
        ? await prisma.customers.findUnique({ where: { id: customer_id } })
        : null;
      if (customer_id && !customer)
        return res.status(404).json({ message: "Customer not found" });

      const dosageForm = dosage_form_id
        ? await prisma.dosageForms.findUnique({ where: { id: dosage_form_id } })
        : null;
      if (dosage_form_id && !dosageForm)
        return res.status(404).json({ message: "Dosage form not found" });

      const parsedQuantity = quantity
        ? parseInt(quantity)
        : existingSale.quantity;
      const parsedPrice = price ? parseFloat(price) : existingSale.price;
      if (
        (quantity && (isNaN(parsedQuantity) || parsedQuantity <= 0)) ||
        (price && (isNaN(parsedPrice) || parsedPrice <= 0))
      ) {
        return res.status(400).json({ message: "Invalid quantity or price" });
      }

      const total_amount = parsedQuantity * parsedPrice;
      const currentETTime = getEthiopianTime();

      const updatedSale = await prisma.sales.update({
        where: { id },
        data: {
          product_name: product_name ?? existingSale.product_name,
          product_batch_number:
            product_batch_number ?? existingSale.product_batch_number,
          quantity: parsedQuantity,
          price: parsedPrice,
          total_amount,
          payment_method: payment_method ?? existingSale.payment_method,
          prescription: prescription ?? existingSale.prescription,
          dosage_form_id: dosage_form_id ?? existingSale.dosage_form_id,
          customer_id: customer_id ?? existingSale.customer_id,
          medicine_id: medicine_id ?? existingSale.medicine_id,
          sealed_date: currentETTime,
          updated_at: currentETTime,
        },
        include: {
          medicine: { select: { medicine_name: true } },
          customer: { select: { name: true } },
          dosage_form: { select: { name: true } },
          createdBy: { select: { username: true } },
        },
      });

      console.log(
        `Updated sale ${id} by user ${req.user?.id || "unknown"}:`,
        updatedSale
      );
      res
        .status(200)
        .json({ message: "Sale updated successfully", sale: updatedSale });
    } catch (error) {
      console.error(`Error updating sale ${id}:`, error.stack);
      res
        .status(500)
        .json({ message: "Error updating sale", error: error.message });
    }
  },

  deleteSale: async (req, res) => {
    const { id } = req.params;

    try {
      const sale = await prisma.sales.findUnique({ where: { id } });
      if (!sale) return res.status(404).json({ message: "Sale not found" });

      await prisma.sales.delete({ where: { id } });

      console.log(`Deleted sale ${id} by user ${req.user?.id || "unknown"}`);
      res.json({ message: "Sale deleted successfully" });
    } catch (error) {
      console.error(`Error deleting sale ${id}:`, error.stack);
      res
        .status(500)
        .json({ message: "Error deleting sale", error: error.message });
    }
  },

  generateSalesReport: async (req, res) => {
    const {
      start_date = null,
      end_date = null,
      customer_id = null,
      limit = 100,
      offset = 0,
    } = req.query;

    console.log("Generating sales report with query:", req.query);

    try {
      const filters = {};
      if (customer_id) filters.customer_id = customer_id;
      if (start_date || end_date) {
        filters.sealed_date = {};
        if (start_date) filters.sealed_date.gte = new Date(start_date);
        if (end_date) filters.sealed_date.lte = new Date(end_date);
      }

      const sales = await prisma.sales.findMany({
        where: filters,
        include: {
          medicine: { select: { medicine_name: true } },
          customer: { select: { name: true } },
          dosage_form: { select: { name: true } },
          createdBy: { select: { username: true } },
        },
        orderBy: { sealed_date: "desc" },
        take: parseInt(limit),
        skip: parseInt(offset),
      });

      const totalSales = sales.reduce(
        (sum, sale) => sum + sale.total_amount,
        0
      );
      const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);

      console.log(
        `Generated report with ${sales.length} sales by user ${
          req.user?.id || "unknown"
        }`
      );
      res.status(200).json({
        summary: { salesCount: sales.length, totalSales, totalQuantity },
        sales,
      });
    } catch (error) {
      console.error("Error generating sales report:", error.stack);
      res
        .status(500)
        .json({
          message: "Error generating sales report",
          error: error.message,
        });
    }
  },
};
