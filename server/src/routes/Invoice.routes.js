import express from "express";
import Invoice from "../models/Invoice.js";
import { requireAuth, requireShop, requirePermission } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth, requireShop, requirePermission("transactions"));

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const query = { shop: req.shopId };
    if (req.query.status) query.status = req.query.status;
    const [data, total] = await Promise.all([
      Invoice.find(query)
        .populate("customer", "name phone")
        .populate("items.product", "name sku")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(query),
    ]);
    return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

export default router;
