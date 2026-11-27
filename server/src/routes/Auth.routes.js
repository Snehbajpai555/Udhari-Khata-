import express from "express";
import { login } from "../controllers/Login.js";
import { signup } from "../controllers/Signup.js";
import User from "../models/User.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);

router.post("/signup", signup);

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        businessName: user.businessName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", requireAuth, (_req, res) => {
  return res.json({ success: true, message: "Logged out successfully." });
});

export default router;
