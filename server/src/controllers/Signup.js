import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";

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

    return res.status(201).json({
      message: "Account created successfully.",
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
