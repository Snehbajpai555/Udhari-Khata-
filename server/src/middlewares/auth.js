import mongoose from "mongoose";
import Staff from "../models/Staff.js";
import { verifyAccessToken } from "../utils/tokens.js";

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    const payload = verifyAccessToken(authorization.slice(7));
    req.userId = payload.sub;
    req.shopId = payload.shopId || null;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session." });
  }
}

export function requireShop(req, res, next) {
  if (!req.shopId || !mongoose.isValidObjectId(req.shopId)) {
    return res.status(403).json({ success: false, message: "Select an authorized shop." });
  }
  return next();
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.userId || !req.shopId) {
      return res.status(403).json({ success: false, message: "Shop access is required." });
    }

    const membership = req.staff || await Staff.findOne({
      shop: req.shopId,
      user: req.userId,
      active: true,
    }).lean();

    if (!membership || !roles.includes(membership.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission for this action." });
    }

    req.staff = membership;
    return next();
  };
}

export function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.userId || !req.shopId) {
      return res.status(403).json({ success: false, message: "Shop access is required." });
    }

    const membership = req.staff || await Staff.findOne({
      shop: req.shopId,
      user: req.userId,
      active: true,
    }).lean();

    if (!membership || membership.permissions?.[permission] !== true) {
      return res.status(403).json({ success: false, message: "You do not have permission for this action." });
    }

    req.staff = membership;
    return next();
  };
}
