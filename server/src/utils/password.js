import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string") {
    return false;
  }

  const [algorithm, saltHex, keyHex] = storedHash.split("$");
  if (
    algorithm !== "scrypt" ||
    !/^[a-f\d]{32}$/i.test(saltHex) ||
    !/^[a-f\d]{128}$/i.test(keyHex)
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(keyHex, "hex");
  const actualKey = await scrypt(password, salt, KEY_LENGTH);
  return timingSafeEqual(actualKey, expectedKey);
}
