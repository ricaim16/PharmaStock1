import prisma from "../config/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

function getEthiopianTime(date = new Date()) {
  const utcDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  );
  const etOffset = 3 * 60 * 60 * 1000; // UTC+3 for East Africa Time
  return new Date(utcDate.getTime() + etOffset);
}

async function generateInvoiceNumber(attempt = 1, maxAttempts = 10) {
  if (attempt > maxAttempts) {
    throw new Error(
      "Unable to generate unique invoice number after maximum attempts"
    );
  }
  const date = getEthiopianTime();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");
  const timestamp = getEthiopianTime().getTime().toString().slice(-6);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${dateString}-${timestamp}-${randomNum}`;

  const existing = await prisma.medicines.findFirst({
    where: { invoice_number: invoiceNumber },
  });
  if (existing) return generateInvoiceNumber(attempt + 1, maxAttempts);
  return invoiceNumber;
}

export const medicineController = {
  getAllMedicines: async (req, res) => {
    try {
      const medicines = await prisma.medicines.findMany({
        include: {
          category: true,
          dosage_form: true,
          supplier: true,
          Sales: true,
          createdBy: { select: { username: true } },
        },
      });
      res.json(medicines);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      res.status(500).json({
        error: { message: "Error fetching medicines", details: error.message },
      });
    }
  },

  getMedicineById: async (req, res) => {
    const { id } = req.params;
    try {
      const medicine = await prisma.medicines.findUnique({
        where: { id },
        include: {
          category: true,
          dosage_form: true,
          supplier: true,
          createdBy: { select: { username: true } },
        },
      });
      if (!medicine)
        return res
          .status(404)
          .json({ error: { message: "Medicine not found" } });
      res.json(medicine);
    } catch (error) {
      console.error(`Error fetching medicine ${id}:`, error);
      res.status(500).json({
        error: { message: "Error fetching medicine", details: error.message },
      });
    }
  },

  addMedicine: async (req, res) => {
    const {
      medicine_name,
      brand_name,
      batch_number,
      category_id,
      dosage_form_id,
      medicine_weight,
      quantity,
      supplier_id,
      unit_price,
      sell_price,
      expire_date,
      required_prescription,
      payment_method,
      details,
    } = req.body;

    const payment_file = req.file
      ? path.join("uploads", req.file.filename).replace(/\\/g, "/")
      : null;

    if (
      !medicine_name ||
      !supplier_id ||
      !unit_price ||
      !quantity ||
      !category_id ||
      !dosage_form_id ||
      !expire_date
    ) {
      return res
        .status(400)
        .json({ error: { message: "Required fields are missing" } });
    }

    try {
      const parsedSupplierId = supplier_id.toString();
      const parsedCategoryId = category_id.toString();
      const parsedDosageFormId = dosage_form_id.toString();
      const parsedQuantity = parseInt(quantity, 10);
      const parsedUnitPrice = parseFloat(unit_price);
      const parsedSellPrice = sell_price ? parseFloat(sell_price) : null;
      const parsedMedicineWeight = medicine_weight
        ? parseFloat(medicine_weight)
        : null;
      const parsedExpireDate = new Date(expire_date);

      if (
        isNaN(parsedQuantity) ||
        isNaN(parsedUnitPrice) ||
        (parsedSellPrice !== null && isNaN(parsedSellPrice)) ||
        (parsedMedicineWeight !== null && isNaN(parsedMedicineWeight)) ||
        isNaN(parsedExpireDate.getTime())
      ) {
        return res
          .status(400)
          .json({ error: { message: "Invalid numeric or date values" } });
      }

      const [supplier, category, dosageForm] = await Promise.all([
        prisma.suppliers.findUnique({ where: { id: parsedSupplierId } }),
        prisma.categories.findUnique({ where: { id: parsedCategoryId } }),
        prisma.dosageForms.findUnique({ where: { id: parsedDosageFormId } }),
      ]);

      if (!supplier)
        return res
          .status(404)
          .json({ error: { message: "Supplier not found" } });
      if (!category)
        return res
          .status(404)
          .json({ error: { message: "Category not found" } });
      if (!dosageForm)
        return res
          .status(404)
          .json({ error: { message: "Dosage form not found" } });

      const invoice_number = await generateInvoiceNumber();
      const total_price = parsedUnitPrice * parsedQuantity;

      const medicine = await prisma.medicines.create({
        data: {
          medicine_name,
          brand_name: brand_name || null,
          batch_number: batch_number || null,
          quantity: parsedQuantity,
          supplier: { connect: { id: parsedSupplierId } },
          invoice_number,
          unit_price: parsedUnitPrice,
          sell_price: parsedSellPrice,
          total_price,
          expire_date: parsedExpireDate,
          required_prescription: required_prescription === "true",
          payment_method: payment_method || "NONE",
          Payment_file: payment_file,
          details: details || null,
          category: { connect: { id: parsedCategoryId } },
          dosage_form: { connect: { id: parsedDosageFormId } },
          medicine_weight: parsedMedicineWeight,
          createdBy: { connect: { id: req.user.id } },
        },
        include: {
          category: true,
          dosage_form: true,
          supplier: true,
          createdBy: true,
        },
      });

      res
        .status(201)
        .json({ message: "Medicine added successfully", medicine });
    } catch (error) {
      console.error("Error adding medicine:", error);
      res.status(500).json({
        error: { message: "Error adding medicine", details: error.message },
      });
    }
  },

  editMedicine: async (req, res) => {
    const { id } = req.params;
    const {
      medicine_name,
      brand_name,
      batch_number,
      category_id,
      dosage_form_id,
      medicine_weight,
      quantity,
      supplier_id,
      unit_price,
      sell_price,
      expire_date,
      required_prescription,
      payment_method,
      details,
    } = req.body;

    const payment_file = req.file
      ? path.join("uploads", req.file.filename).replace(/\\/g, "/")
      : undefined;

    try {
      const existingMedicine = await prisma.medicines.findUnique({
        where: { id },
      });
      if (!existingMedicine)
        return res
          .status(404)
          .json({ error: { message: "Medicine not found" } });

      const parsedSupplierId = supplier_id ? supplier_id.toString() : undefined;
      const parsedCategoryId = category_id ? category_id.toString() : undefined;
      const parsedDosageFormId = dosage_form_id
        ? dosage_form_id.toString()
        : undefined;
      const parsedQuantity =
        quantity !== undefined ? parseInt(quantity, 10) : undefined;
      const parsedUnitPrice =
        unit_price !== undefined ? parseFloat(unit_price) : undefined;
      const parsedSellPrice =
        sell_price !== undefined ? parseFloat(sell_price) : undefined;
      const parsedMedicineWeight =
        medicine_weight !== undefined ? parseFloat(medicine_weight) : undefined;
      const parsedExpireDate = expire_date ? new Date(expire_date) : undefined;

      if (
        (parsedQuantity !== undefined && isNaN(parsedQuantity)) ||
        (parsedUnitPrice !== undefined && isNaN(parsedUnitPrice)) ||
        (parsedSellPrice !== undefined && isNaN(parsedSellPrice)) ||
        (parsedMedicineWeight !== undefined && isNaN(parsedMedicineWeight)) ||
        (parsedExpireDate !== undefined && isNaN(parsedExpireDate?.getTime()))
      ) {
        return res
          .status(400)
          .json({ error: { message: "Invalid numeric or date values" } });
      }

      if (parsedSupplierId) {
        const supplier = await prisma.suppliers.findUnique({
          where: { id: parsedSupplierId },
        });
        if (!supplier)
          return res
            .status(404)
            .json({ error: { message: "Supplier not found" } });
      }

      const updatedUnitPrice =
        parsedUnitPrice !== undefined
          ? parsedUnitPrice
          : existingMedicine.unit_price;
      const updatedQuantity =
        parsedQuantity !== undefined
          ? parsedQuantity
          : existingMedicine.quantity;
      const total_price = updatedUnitPrice * updatedQuantity;

      const medicine = await prisma.medicines.update({
        where: { id },
        data: {
          medicine_name: medicine_name ?? existingMedicine.medicine_name,
          brand_name: brand_name ?? existingMedicine.brand_name,
          batch_number: batch_number ?? existingMedicine.batch_number,
          category_id: parsedCategoryId ?? existingMedicine.category_id,
          dosage_form_id: parsedDosageFormId ?? existingMedicine.dosage_form_id,
          medicine_weight:
            parsedMedicineWeight ?? existingMedicine.medicine_weight,
          quantity: updatedQuantity,
          supplier_id: parsedSupplierId ?? existingMedicine.supplier_id,
          unit_price: updatedUnitPrice,
          sell_price: parsedSellPrice ?? existingMedicine.sell_price,
          total_price,
          expire_date: parsedExpireDate ?? existingMedicine.expire_date,
          required_prescription:
            required_prescription !== undefined
              ? Boolean(required_prescription)
              : existingMedicine.required_prescription,
          payment_method: payment_method ?? existingMedicine.payment_method,
          Payment_file:
            payment_file !== undefined
              ? payment_file
              : existingMedicine.Payment_file,
          details: details ?? existingMedicine.details,
        },
        include: {
          category: true,
          dosage_form: true,
          supplier: true,
          createdBy: true,
        },
      });

      res
        .status(200)
        .json({ message: "Medicine updated successfully", medicine });
    } catch (error) {
      console.error(`Error updating medicine ${id}:`, error);
      res.status(500).json({
        error: { message: "Error updating medicine", details: error.message },
      });
    }
  },

  deleteMedicine: async (req, res) => {
    const { id } = req.params;
    try {
      const medicine = await prisma.medicines.findUnique({ where: { id } });
      if (!medicine)
        return res
          .status(404)
          .json({ error: { message: "Medicine not found" } });

      await prisma.medicines.delete({ where: { id } });
      res.json({ message: "Medicine deleted successfully" });
    } catch (error) {
      console.error(`Error deleting medicine ${id}:`, error);
      res.status(500).json({
        error: { message: "Error deleting medicine", details: error.message },
      });
    }
  },

  getLowStockMedicines: async (req, res) => {
    const LOW_STOCK_THRESHOLD = 10;
    try {
      const lowStockMedicines = await prisma.medicines.findMany({
        where: { quantity: { lte: LOW_STOCK_THRESHOLD } },
        include: { category: true, dosage_form: true, supplier: true },
      });
      console.log(`Fetched ${lowStockMedicines.length} low stock medicines`);
      res.json(lowStockMedicines);
    } catch (error) {
      console.error("Error fetching low stock medicines:", error);
      res.status(500).json({
        error: {
          message: "Error fetching low stock medicines",
          details: error.message,
        },
      });
    }
  },

  generateMedicineReport: async (req, res) => {
    console.log("Generating medicine report...");
    try {
      // Fetch all medicines with their sales and creator
      const medicines = await prisma.medicines.findMany({
        include: {
          Sales: true,
          createdBy: { select: { username: true } },
        },
      });

      console.log("Medicines fetched:", medicines.length);
      if (!medicines.length) {
        console.log("No medicines found, returning empty report");
        return res.json({
          generatedAt: getEthiopianTime(),
          winningProducts: [],
          worstPerformingProducts: [],
          stockLevels: [],
        });
      }

      // Calculate total sales for each medicine
      const medicineSales = medicines.map((med) => {
        const totalSales = med.Sales.reduce(
          (sum, sale) => sum + sale.quantity,
          0
        );
        return { ...med, totalSales };
      });

      // Sort by total sales to determine top and worst performers
      const sortedBySales = [...medicineSales].sort(
        (a, b) => b.totalSales - a.totalSales
      );

      // Winning Products (Top Sellers): Top 5 or fewer
      const winningProducts = sortedBySales
        .slice(0, Math.min(5, sortedBySales.length))
        .map((med) => ({
          id: med.id,
          medicine_name: med.medicine_name,
          totalSales: med.totalSales,
        }));

      // Worst-Performing Products (Low Sellers): Bottom 5 with sales > 0, reversed
      const worstPerformingProducts = sortedBySales
        .filter((med) => med.totalSales > 0)
        .slice(
          -Math.min(5, sortedBySales.filter((med) => med.totalSales > 0).length)
        )
        .reverse()
        .map((med) => ({
          id: med.id,
          medicine_name: med.medicine_name,
          totalSales: med.totalSales,
        }));

      // Stock Levels: All medicines with quantity, expiry, and creator
      const stockLevels = medicines.map((med) => ({
        id: med.id,
        medicine_name: med.medicine_name,
        quantity: med.quantity,
        expire_date: med.expire_date,
        createdBy: med.createdBy.username,
      }));

      const report = {
        generatedAt: getEthiopianTime(),
        winningProducts,
        worstPerformingProducts,
        stockLevels,
      };

      console.log("Report generated successfully");
      res.json(report);
    } catch (error) {
      console.error("Error generating medicine report:", error);
      res.status(500).json({
        error: { message: "Error generating report", details: error.message },
      });
    }
  },
};
