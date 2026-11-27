import Shop from "../models/Shop.js";
import Staff from "../models/Staff.js";
import { signAccessToken } from "../utils/tokens.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export async function listShops(req, res, next) {
  try {
    const memberships = await Staff.find({ user: req.userId, active: true }).populate("shop").lean();
    return res.json({
      success: true,
      shops: memberships
        .filter((membership) => membership.shop)
        .map((membership) => ({
          id: membership.shop._id,
          name: membership.shop.name,
          businessType: membership.shop.businessType,
          role: membership.role,
        })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function createShop(req, res, next) {
  const { name, businessType, phone, email, address } = req.body ?? {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof businessType !== "string" ||
    !["manufacturer", "retailer", "wholesaler", "affiliate", "service", "other"].includes(businessType)
  ) {
    return res.status(400).json({ success: false, message: "Provide a shop name and valid business type." });
  }

  try {
    const shop = await Shop.create({
      name: name.trim(),
      owner: req.userId,
      businessType,
      phone: typeof phone === "string" ? phone.trim() : "",
      email: typeof email === "string" ? email.trim().toLowerCase() : "",
      address: typeof address === "string" ? address.trim() : "",
    });
    await Staff.create({
      shop: shop._id,
      user: req.userId,
      role: "Owner",
      permissions: { customers: true, transactions: true, inventory: true, reports: true, settings: true },
    });

    const user = await User.findById(req.userId);
    const accessToken = signAccessToken(user, shop.id);
    return res.status(201).json({
      success: true,
      accessToken,
      shop: { id: shop.id, name: shop.name, businessType: shop.businessType },
    });
  } catch (error) {
    return next(error);
  }
}

export async function switchShop(req, res, next) {
  const { shopId } = req.params;
  if (!mongoose.isValidObjectId(shopId)) {
    return res.status(400).json({ success: false, message: "Invalid shop identifier." });
  }
  try {
    const membership = await Staff.findOne({ shop: shopId, user: req.userId, active: true }).lean();
    if (!membership) return res.status(403).json({ success: false, message: "You do not belong to this shop." });

    const shop = await Shop.findById(shopId).lean();
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found." });
    const user = await User.findById(req.userId);
    return res.json({
      success: true,
      accessToken: signAccessToken(user, shopId),
      shop: { id: shop._id, name: shop.name, businessType: shop.businessType, role: membership.role },
    });
  } catch (error) {
    return next(error);
  }
}
