import express from "express";
import { requireAuth, requireShop, requireRole, requirePermission } from "../middlewares/auth.js";
import { createShop, listShops, switchShop } from "../controllers/Shop.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", listShops);
router.post("/", requireShop, requirePermission("settings"), requireRole("Owner"), createShop);
router.post("/:shopId/switch", switchShop);

export default router;
