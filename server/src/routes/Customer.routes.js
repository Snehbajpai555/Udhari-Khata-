import express from "express";
import { z } from "zod";
import Customer from "../models/Customer.js";
import Transaction from "../models/Transaction.js";
import { requireAuth, requireShop, requireRole, requirePermission } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth, requireShop, requirePermission("customers"));

const customerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(20),
  address: z.string().trim().max(300).optional().default(""),
  category: z.enum(["Regular", "Retail", "Wholesale"]).optional().default("Regular"),
  openingBalancePaise: z.number().int().nonnegative().optional().default(0),
  creditLimitPaise: z.number().int().nonnegative().optional().default(0),
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const query = { shop: req.shopId, active: true };
    if (req.query.search) {
      query.$or = [
        { name: { $regex: String(req.query.search).trim(), $options: "i" } },
        { phone: { $regex: String(req.query.search).trim(), $options: "i" } },
      ];
    }
    if (req.query.category) query.category = req.query.category;
    const [items, total] = await Promise.all([
      Customer.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Customer.countDocuments(query),
    ]);
    return res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/ledger", async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, shop: req.shopId }).lean();
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });
    const transactions = await Transaction.find({
      shop: req.shopId,
      customer: customer._id,
    }).sort({ transactionDate: -1 }).limit(200).lean();
    return res.json({ success: true, customer, data: transactions });
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireRole("Owner", "Manager", "Staff"), async (req, res, next) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid customer data.", errors: parsed.error.flatten() });
  try {
    const existing = await Customer.findOne({ shop: req.shopId, phone: parsed.data.phone });
    if (existing) return res.status(409).json({ success: false, message: "A customer with this phone already exists." });
    const customer = await Customer.create({
      shop: req.shopId,
      ...parsed.data,
      outstandingPaise: parsed.data.openingBalancePaise,
    });
    return res.status(201).json({ success: true, data: customer });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", requireRole("Owner", "Manager"), async (req, res, next) => {
  const parsed = customerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid customer data.", errors: parsed.error.flatten() });
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, shop: req.shopId },
      { $set: parsed.data },
      { returnDocument: "after", runValidators: true },
    );
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });
    return res.json({ success: true, data: customer });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireRole("Owner"), async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, shop: req.shopId },
      { $set: { active: false } },
      { returnDocument: "after" },
    );
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found." });
    return res.json({ success: true, message: "Customer removed." });
  } catch (error) {
    return next(error);
  }
});

export default router;
