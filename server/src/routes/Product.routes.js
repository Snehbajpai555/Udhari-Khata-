import express from "express";
import { z } from "zod";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { requireAuth, requireShop, requireRole, requirePermission } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth, requireShop, requirePermission("inventory"));

const productSchema = z.object({
  name: z.string().trim().min(1).max(160),
  sku: z.string().trim().min(1).max(80),
  category: z.string().trim().max(80).optional().default("General"),
  purchasePricePaise: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  sellingPricePaise: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  stock: z.number().int().nonnegative().optional().default(0),
  minimumStock: z.number().int().nonnegative().optional().default(0),
  expiryDate: z.string().datetime({ offset: true }).optional().nullable(),
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const query = { shop: req.shopId, active: true };
    if (req.query.search) query.$or = [
      { name: { $regex: String(req.query.search).trim(), $options: "i" } },
      { sku: { $regex: String(req.query.search).trim(), $options: "i" } },
    ];
    if (req.query.lowStock === "true") {
      query.$expr = { $lte: ["$stock", "$minimumStock"] };
    }
    const [items, total] = await Promise.all([
      Product.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(query),
    ]);
    return res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireRole("Owner", "Manager"), async (req, res, next) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid product.", errors: parsed.error.flatten() });
  try {
    const product = await Product.create({
      shop: req.shopId,
      ...parsed.data,
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
    });
    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/adjust", requireRole("Owner", "Manager"), async (req, res, next) => {
  const parsed = z.object({
    quantity: z.number().int(),
    reason: z.string().trim().max(300).optional().default("Stock adjustment"),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid stock adjustment.", errors: parsed.error.flatten() });
  try {
    const product = await Product.findOne({ _id: req.params.id, shop: req.shopId });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    const nextStock = product.stock + parsed.data.quantity;
    if (nextStock < 0) return res.status(422).json({ success: false, message: "Adjustment would produce negative stock." });
    product.stock = nextStock;
    await product.save();
    await StockMovement.create({
      shop: req.shopId,
      product: product._id,
      type: "Adjustment",
      quantity: parsed.data.quantity,
      balanceAfter: product.stock,
      unitCostPaise: product.purchasePricePaise,
      reason: parsed.data.reason,
      createdBy: req.userId,
    });
    return res.json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
});

export default router;
