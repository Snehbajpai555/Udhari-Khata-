import User from "../models/User.js";
import Staff from "../models/Staff.js";
import { verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/tokens.js";

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function login(req, res, next) {
  const { email, phone, password } = req.body ?? {};
  const hasEmail = email !== undefined;
  const hasPhone = phone !== undefined;

  if (
    hasEmail === hasPhone ||
    (hasEmail && (typeof email !== "string" || !isEmail(email.trim()))) ||
    (hasPhone && (typeof phone !== "string" || !phone.trim())) ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      message: "Provide either a valid email or phone number, and a password.",
    });
  }

  try {
    const query = hasEmail
      ? { email: email.trim().toLowerCase() }
      : { phone: phone.trim() };
    const user = await User.findOne(query).select("+password");
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const membership = await Staff.findOne({ user: user._id, active: true }).sort({ updatedAt: -1 }).lean();
    const accessToken = signAccessToken(user, membership?.shop?.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      shop: membership?.shop ? { id: membership.shop.toString() } : null,
      user: {
        id: user.id,
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
}