import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Staff from "../models/Staff.js";
import { hashPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/tokens.js";

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function signup(req, res, next) {
  const { name, businessName, email, password, role, phone } = req.body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof businessName !== "string" ||
    !businessName.trim() ||
    typeof email !== "string" ||
    !isEmail(email.trim()) ||
    typeof phone !== "string" ||
    !phone.trim() ||
    typeof password !== "string" ||
    password.length < 8 ||
    typeof role !== "string" ||
    !User.schema.path("role").enumValues.includes(role)
  ) {
    return res.status(400).json({
      message: "Provide your name, business name, valid email, phone number, password of at least 8 characters, and valid role.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  try {
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email or phone number already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      businessName: businessName.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      role,
      phone: normalizedPhone,
    });

    const shop = await Shop.create({
      name: businessName.trim(),
      owner: user._id,
      businessType: role,
      phone: normalizedPhone,
      email: normalizedEmail,
    });

    await Staff.create({
      shop: shop._id,
      user: user._id,
      role: "Owner",
      permissions: {
        customers: true,
        transactions: true,
        inventory: true,
        reports: true,
        settings: true,
      },
    });

    const accessToken = signAccessToken(user, shop.id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      accessToken,
      shop: { id: shop.id, name: shop.name, businessType: shop.businessType },
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
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "An account with this email or phone number already exists.",
      });
    }
    return next(error);
  }
}
