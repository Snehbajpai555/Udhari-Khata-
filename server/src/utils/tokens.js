import jwt from "jsonwebtoken";

export function signAccessToken(user, shopId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required.");

  return jwt.sign(
    { sub: user.id, shopId: shopId || null },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d", issuer: "udhari-khata" },
  );
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required.");
  return jwt.verify(token, secret, { issuer: "udhari-khata" });
}
