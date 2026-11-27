import express from "express";
import { z } from "zod";
import Transaction from "../models/Transaction.js";
import { requireAuth, requireShop, requireRole, requirePermission } from "../middlewares/auth.js";
import {
  createCredit,
  createPayment,
  createSale,
  createPurchase,
  createExpense,
  createSupplierPayment,
  reverseTransaction,
} from "../services/ledgerService.js";

const router = express.Router();
router.use(requireAuth, requireShop, requirePermission("transactions"));

const paise = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const paymentMethod = z.enum(["Cash", "UPI", "Bank", "Cheque", "Credit"]);
const receiptMethod = z.enum(["Cash", "UPI", "Bank", "Cheque"]);
const idempotencyKeySchema = z.string().trim().min(1).max(120).optional();

function getIdempotencyKey(req, res) {
  const parsed = idempotencyKeySchema.safeParse(req.headers["idempotency-key"]);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Idempotency-Key must be between 1 and 120 characters." });
    return { valid: false, value: null };
  }
  return { valid: true, value: parsed.data || null };
}

async function handleError(res, next, error) {
  if (error?.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
  return next(error);
}

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const query = { shop: req.shopId };
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.from || req.query.to) {
      query.transactionDate = {};
      if (req.query.from) query.transactionDate.$gte = new Date(req.query.from);
      if (req.query.to) query.transactionDate.$lte = new Date(req.query.to);
    }
    const [items, total] = await Promise.all([
      Transaction.find(query).populate("customer supplier").sort({ transactionDate: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Transaction.countDocuments(query),
    ]);
    return res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

router.post("/credit", requireRole("Owner", "Manager", "Staff"), async (req, res, next) => {
  const schema = z.object({
    customerId: z.string().min(1),
    amountPaise: paise.min(1),
    paymentMethod: paymentMethod.optional(),
    description: z.string().trim().max(300).optional().default(""),
    transactionDate: z.string().datetime({ offset: true }).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid credit transaction.", errors: parsed.error.flatten() });
  const idempotency = getIdempotencyKey(req, res);
  if (!idempotency.valid) return;
  try {
    const data = await createCredit({
      shopId: req.shopId,
      actorId: req.userId,
      ipAddress: req.ip,
      idempotencyKey: idempotency.value,
      ...parsed.data,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, next, error);
  }
});

router.post("/payment", requireRole("Owner", "Manager", "Staff"), async (req, res, next) => {
  const schema = z.object({
    customerId: z.string().min(1),
    amountPaise: paise.min(1),
    paymentMethod: receiptMethod.optional(),
    description: z.string().trim().max(300).optional().default(""),
    transactionDate: z.string().datetime({ offset: true }).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid payment.", errors: parsed.error.flatten() });
  const idempotency = getIdempotencyKey(req, res);
  if (!idempotency.valid) return;
  try {
    const data = await createPayment({
      shopId: req.shopId,
      actorId: req.userId,
      ipAddress: req.ip,
      idempotencyKey: idempotency.value,
      ...parsed.data,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, next, error);
  }
});

router.post("/sale", requireRole("Owner", "Manager", "Staff"), async (req, res, next) => {
  const schema = z.object({
    customerId: z.string().optional(),
    amountPaidPaise: paise,
    paymentMethod: paymentMethod.optional(),
    items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(1000000) })).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid sale.", errors: parsed.error.flatten() });
  const idempotency = getIdempotencyKey(req, res);
  if (!idempotency.valid) return;
  try {
    const data = await createSale({
      shopId: req.shopId,
      actorId: req.userId,
      ipAddress: req.ip,
      idempotencyKey: idempotency.value,
      ...parsed.data,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, next, error);
  }
});

router.post("/purchase", requireRole("Owner", "Manager"), async (req, res, next) => {
  const schema = z.object({
    supplierId: z.string().min(1),
    amountPaidPaise: paise,
    paymentMethod: paymentMethod.optional(),
    items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(1000000) })).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid purchase.", errors: parsed.error.flatten() });
  const idempotency = getIdempotencyKey(req, res);
  if (!idempotency.valid) return;
  try {
    const data = await createPurchase({
      shopId: req.shopId,
      actorId: req.userId,
      ipAddress: req.ip,
      idempotencyKey: idempotency.value,
      ...parsed.data,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, next, error);
  }
});

router.post("/expense", requireRole("Owner", "Manager", "Staff"), async (req, res, next) => {
  const schema = z.object({
    category: z.string().trim().min(1).max(80),
    amountPaise: paise.min(1),
    paymentMethod: z.enum(["Cash", "UPI", "Bank", "Cheque"]),
    description: z.string().trim().max(300).optional().default(""),
    expenseDate: z.string().datetime({ offset: true }).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid expense.", errors: parsed.error.flatten() });
  const idempotency = getIdempotencyKey(req, res);
  if (!idempotency.valid) return;
  try {
    const data = await createExpense({
      shopId: req.shopId,
      actorId: req.userId,
      ipAddress: req.ip,
      idempotencyKey: idempotency.value,
      ...parsed.data,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, next, error);
  }
});

router.post("/supplier-payment", requireRole("Owner", "Manager"), async (req, res, next) => {
  const schema = z.object({
    supplierId: z.string().min(1),
    amountPaise: paise.min(1),
    paymentMethod: z.enum(["Cash", "UPI", "Bank", "Cheque"]),
    description: z.string().trim().max(300).optional().default(""),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid supplier payment.", errors: parsed.error.flatten() });
  const idempotency = getIdempotencyKey(req, res);
  if (!idempotency.valid) return;
  try {
    const data = await createSupplierPayment({
      shopId: req.shopId,
      actorId: req.userId,
      ipAddress: req.ip,
      idempotencyKey: idempotency.value,
      ...parsed.data,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, next, error);
  }
});

router.post("/:id/reverse", requireRole("Owner", "Manager"), async (req, res, next) => {
  try {
    const data = await reverseTransaction({
      shopId: req.shopId,
      actorId: req.userId,
      transactionId: req.params.id,
      ipAddress: req.ip,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, next, error);
  }
});

export default router;
