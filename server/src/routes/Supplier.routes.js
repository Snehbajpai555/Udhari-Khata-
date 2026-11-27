import express from "express";
import { z } from "zod";
import Supplier from "../models/Supplier.js";
import { requireAuth, requireShop, requireRole, requirePermission } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth, requireShop, requirePermission("inventory"));

const supplierSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(20).optional().default(""),
  email: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().default(""),
  outstandingPaise: z.number().int().nonnegative().optional().default(0),
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const query = { shop: req.shopId, active: true };
    if (req.query.search) query.name = { $regex: String(req.query.search).trim(), $options: "i" };
    const [items, total] = await Promise.all([
      Supplier.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Supplier.countDocuments(query),
    ]);
    return res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireRole("Owner", "Manager"), async (req, res, next) => {
  const parsed = supplierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid supplier.", errors: parsed.error.flatten() });
  try {
    const supplier = await Supplier.create({ shop: req.shopId, ...parsed.data });
    return res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    return next(error);
  }
});

export default router;
