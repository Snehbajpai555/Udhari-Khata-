import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function signup(req, res, next) {
  const { name, email, password, role } = req.body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !isEmail(email.trim()) ||
    typeof password !== "string" ||
    password.length < 8 ||
    typeof role !== "string" ||
    !User.schema.path("role").enumValues.includes(role)
  ) {
    return res.status(400).json({
      message: "Provide a name, valid email, password of at least 8 characters, and valid role.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      role,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    return next(error);
  }
}