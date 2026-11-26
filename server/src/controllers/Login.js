import User from "../models/User.js";
import { verifyPassword } from "../utils/password.js";

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function login(req, res, next) {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    !isEmail(email.trim()) ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({ message: "Provide a valid email and password." });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}